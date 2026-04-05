import Foundation

@Observable
class StreaksViewModel {
    let api: APIClient
    let userId: String

    var streak: StreakData?
    var isLoading = false
    var isRecording = false
    var error: String?

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response: StreakResponse = try await api.request(.getStreak(userId: userId))
            streak = response.streak
        } catch {
            self.error = error.localizedDescription
        }
    }

    func recordActivity() async {
        isRecording = true
        defer { isRecording = false }
        do {
            let _: StreakResponse = try await api.request(
                .recordActivity, body: RecordActivityRequest(userId: userId)
            )
            await load()
        } catch {
            self.error = error.localizedDescription
        }
    }

    var weeklyCompletionPercent: Int {
        guard let streak = streak else { return 0 }
        let completed = streak.weeklyProgress.filter { $0 }.count
        let total = streak.weeklyProgress.count
        guard total > 0 else { return 0 }
        return Int(Double(completed) / Double(total) * 100)
    }
}
