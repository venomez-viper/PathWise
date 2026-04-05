import Foundation

struct StreakData: Codable {
    let currentStreak: Int
    let bestStreak: Int
    let lastActiveDate: String?
    let consistencyScore: Int
    let totalXp: Int
    let weeklyProgress: [Bool]
}

struct StreakResponse: Codable {
    let streak: StreakData
}

struct RecordActivityRequest: Codable {
    let userId: String
}
