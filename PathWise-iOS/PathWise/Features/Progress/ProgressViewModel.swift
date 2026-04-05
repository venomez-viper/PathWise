import Foundation
import Observation

@MainActor
@Observable
class ProgressViewModel {
    let api: APIClient
    let userId: String

    var stats: ProgressStats?
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
            let response: ProgressResponse = try await api.request(.getProgress(userId: userId))
            stats = response.stats
        } catch {
            self.error = error.localizedDescription
        }
    }
}
