import Foundation
import Observation

// MARK: - Search Result Types

struct RoleSearchResult: Identifiable {
    let id: String
    let title: String
    let matchScore: Int
    let opportunities: String
}

struct CourseSearchResult: Identifiable {
    let id: String
    let name: String
    let moduleCount: Int
    let provider: String
    let level: String
}

struct SkillSearchResult: Identifiable {
    let id: String
    let name: String
}

// MARK: - Search ViewModel

@Observable
class SearchViewModel {
    var query: String = ""

    // Source data from assessment + tasks
    var careerMatches: [CareerMatch] = []
    var taskItems: [TaskItem] = []

    // MARK: Filtered results

    var roleResults: [RoleSearchResult] {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else { return [] }
        let q = query.lowercased()
        return careerMatches
            .filter { $0.title.lowercased().contains(q) || $0.description.lowercased().contains(q) }
            .map { match in
                RoleSearchResult(
                    id: match.id,
                    title: match.title,
                    matchScore: match.matchScore,
                    opportunities: "3,420 open opportunities"
                )
            }
    }

    var courseResults: [CourseSearchResult] {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else { return [] }
        let q = query.lowercased()
        // Synthesise course results from required skills that match the query
        var courses: [CourseSearchResult] = []
        for match in careerMatches {
            for skill in match.requiredSkills where skill.lowercased().contains(q) || match.title.lowercased().contains(q) {
                let course = CourseSearchResult(
                    id: "\(match.id)-\(skill)",
                    name: "\(skill) Fundamentals",
                    moduleCount: Int.random(in: 6...14),
                    provider: "PathWise Academy",
                    level: "Beginner"
                )
                if !courses.contains(where: { $0.name == course.name }) {
                    courses.append(course)
                }
            }
        }
        // Also match against task titles
        let taskCourses = taskItems
            .filter { $0.title.lowercased().contains(q) || ($0.description ?? "").lowercased().contains(q) }
            .map { task in
                CourseSearchResult(
                    id: task.id,
                    name: task.title,
                    moduleCount: 8,
                    provider: "PathWise Academy",
                    level: "Intermediate"
                )
            }
        courses.append(contentsOf: taskCourses.filter { tc in !courses.contains(where: { $0.id == tc.id }) })
        return Array(courses.prefix(5))
    }

    var skillResults: [SkillSearchResult] {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else { return [] }
        let q = query.lowercased()
        var seen = Set<String>()
        var results: [SkillSearchResult] = []
        for match in careerMatches {
            for skill in match.requiredSkills where skill.lowercased().contains(q) {
                if seen.insert(skill.lowercased()).inserted {
                    results.append(SkillSearchResult(id: skill, name: skill))
                }
            }
        }
        return Array(results.prefix(8))
    }

    var hasResults: Bool {
        !roleResults.isEmpty || !courseResults.isEmpty || !skillResults.isEmpty
    }

    // MARK: - Load

    func populate(matches: [CareerMatch], tasks: [TaskItem]) {
        careerMatches = matches
        taskItems = tasks
    }

    func clearQuery() {
        query = ""
    }
}
