import Foundation

@Observable
class RoadmapViewModel {
    let api: APIClient
    let userId: String

    var roadmap: Roadmap?
    var tasks: [TaskItem] = []
    var assessment: AssessmentResult?
    var isLoading = false
    var error: String?
    var selectedTimeline: TimelineOption = .standard
    var showAdjustTimeline = false

    // MARK: - Computed groupings

    var courseTasks: [TaskItem] {
        tasks.filter { $0.category?.lowercased() == "course" || $0.category?.lowercased() == "courses" }
    }

    var projectTasks: [TaskItem] {
        tasks.filter { $0.category?.lowercased() == "project" || $0.category?.lowercased() == "projects" }
    }

    var networkingTasks: [TaskItem] {
        tasks.filter { $0.category?.lowercased() == "networking" }
    }

    var skillGaps: [SkillGap] {
        assessment?.skillGaps ?? []
    }

    var completionFraction: Double {
        guard let pct = roadmap?.completionPercent else { return 0 }
        return Double(pct) / 100.0
    }

    // MARK: - Init

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    // MARK: - Load

    func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        async let roadmapReq: RoadmapResponse = api.request(.getRoadmap(userId: userId))
        async let tasksReq: TaskListResponse = api.request(.listTasks(userId: userId))
        async let assessmentReq: AssessmentResponse = api.request(.getAssessment(userId: userId))

        do {
            let (r, t, a) = try await (roadmapReq, tasksReq, assessmentReq)
            roadmap = r.roadmap
            tasks = t.tasks
            assessment = a.result
        } catch {
            // Best-effort partial load
            do { roadmap = (try await api.request(.getRoadmap(userId: userId)) as RoadmapResponse).roadmap } catch {}
            do { tasks = (try await api.request(.listTasks(userId: userId)) as TaskListResponse).tasks } catch {}
            do { assessment = (try await api.request(.getAssessment(userId: userId)) as AssessmentResponse).result } catch {}
            self.error = "Some data could not be loaded."
        }
    }

    // MARK: - Complete Milestone

    func completeMilestone(_ milestoneId: String) async {
        do {
            let _: CompleteMilestoneResponse = try await api.request(.completeMilestone(milestoneId: milestoneId))
            await load()
        } catch {
            self.error = "Failed to complete milestone."
        }
    }

    // MARK: - Adjust Timeline

    func updateTimeline() async {
        guard let roadmap else { return }
        let req = GenerateRoadmapRequest(
            userId: userId,
            targetRole: roadmap.targetRole,
            timeline: selectedTimeline.apiValue
        )
        do {
            let response: RoadmapResponse = try await api.request(.generateRoadmap, body: req)
            self.roadmap = response.roadmap
            showAdjustTimeline = false
        } catch {
            self.error = "Failed to update timeline."
        }
    }
}

// MARK: - Timeline Options

enum TimelineOption: CaseIterable, Identifiable {
    case accelerated, standard, relaxed, extended

    var id: Self { self }

    var months: Int {
        switch self {
        case .accelerated: return 3
        case .standard:    return 6
        case .relaxed:     return 9
        case .extended:    return 12
        }
    }

    var label: String {
        switch self {
        case .accelerated: return "Accelerated"
        case .standard:    return "Standard Pace"
        case .relaxed:     return "Relaxed"
        case .extended:    return "Extended"
        }
    }

    var weeklyHours: String {
        switch self {
        case .accelerated: return "~16 hrs/week effort"
        case .standard:    return "~8 hrs/week effort"
        case .relaxed:     return "~5 hrs/week effort"
        case .extended:    return "~3 hrs/week effort"
        }
    }

    var iconName: String {
        switch self {
        case .accelerated: return "bolt.fill"
        case .standard:    return "star.fill"
        case .relaxed:     return "leaf.fill"
        case .extended:    return "calendar"
        }
    }

    var isRecommended: Bool { self == .standard }

    var apiValue: String { "\(months)m" }
}
