import Foundation

struct Roadmap: Codable, Identifiable {
    let id: String
    let userId: String
    let targetRole: String
    let completionPercent: Int
    let milestones: [Milestone]
}

struct Milestone: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let status: String
    let dueDate: String?
    let estimatedWeeks: Int?
    let skillsTargeted: String?
}

struct RoadmapResponse: Codable {
    let roadmap: Roadmap?
}

struct GenerateRoadmapRequest: Codable {
    let userId: String
    let targetRole: String
    let timeline: String?
}

struct CompleteMilestoneResponse: Codable {
    let success: Bool
    let nextMilestoneId: String?
}
