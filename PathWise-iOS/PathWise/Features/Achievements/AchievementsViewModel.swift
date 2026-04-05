import Foundation
import Observation

@MainActor
@Observable
class AchievementsViewModel {
    let api: APIClient
    let userId: String

    var achievements: [AchievementData] = []
    var totalBadges: Int = 0
    var earnedCount: Int = 0
    var totalXp: Int = 0
    var seasonProgress: SeasonProgress?
    var isLoading = false
    var error: String?

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response: AchievementsResponse = try await api.request(.getAchievements(userId: userId))
            achievements = response.achievements
            totalBadges = response.totalBadges
            earnedCount = response.earnedCount
            totalXp = response.totalXp
            seasonProgress = response.seasonProgress
        } catch {
            self.error = error.localizedDescription
        }
    }

    var earnedAchievements: [AchievementData] {
        achievements.filter { $0.earnedAt != nil }
    }

    var lockedAchievements: [AchievementData] {
        achievements.filter { $0.earnedAt == nil }
    }

    var seasonXpProgress: Double {
        guard let season = seasonProgress, season.nextLevelXp > 0 else { return 0 }
        return Double(season.currentXp) / Double(season.nextLevelXp)
    }
}
