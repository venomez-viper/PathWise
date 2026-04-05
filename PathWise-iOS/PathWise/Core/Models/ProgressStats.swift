import Foundation

struct ProgressStats: Codable {
    let roadmapCompletion: Int
    let tasksFinished: Int
    let tasksRemaining: Int
    let jobReadinessScore: Int
    let careerReadinessScore: Int
    let breakdown: ReadinessBreakdown?
}

struct ReadinessBreakdown: Codable {
    let milestoneProgress: Int
    let taskCompletion: Int
    let categoryBalance: Int
    let momentum: Int
    let overall: Int
}

struct ProgressResponse: Codable {
    let stats: ProgressStats
}
