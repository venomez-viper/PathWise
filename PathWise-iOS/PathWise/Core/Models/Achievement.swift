import Foundation

struct AchievementData: Codable, Identifiable {
    var id: String { badgeKey }
    let badgeKey: String
    let title: String
    let description: String
    let earnedAt: String?
}

struct AchievementsResponse: Codable {
    let achievements: [AchievementData]
    let totalBadges: Int
    let earnedCount: Int
    let totalXp: Int
    let seasonProgress: SeasonProgress?
}

struct SeasonProgress: Codable {
    let level: Int
    let currentXp: Int
    let nextLevelXp: Int
    let tier: String
}

struct AwardAchievementRequest: Codable {
    let userId: String
    let badgeKey: String
}
