import Foundation
import Observation

@Observable
class NotificationsViewModel {
    let api: APIClient
    let userId: String

    var notifications: [AppNotification] = []
    var isLoading = false
    var error: String?

    var todayNotifications: [AppNotification] {
        notifications.filter { isToday($0.createdAt) }
    }

    var earlierNotifications: [AppNotification] {
        notifications.filter { !isToday($0.createdAt) }
    }

    var unreadCount: Int {
        notifications.filter { !$0.read }.count
    }

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response: NotificationsResponse = try await api.request(.getNotifications(userId: userId))
            notifications = response.notifications
        } catch {
            self.error = error.localizedDescription
        }
    }

    func markAllRead() async {
        do {
            try await api.send(.markNotificationsRead, body: MarkReadRequest(userId: userId))
            notifications = notifications.map { n in
                AppNotification(
                    id: n.id,
                    userId: n.userId,
                    type: n.type,
                    title: n.title,
                    body: n.body,
                    read: true,
                    createdAt: n.createdAt
                )
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Helpers

    private func isToday(_ isoString: String) -> Bool {
        guard let date = ISO8601DateFormatter().date(from: isoString) else { return false }
        return Calendar.current.isDateInToday(date)
    }
}
