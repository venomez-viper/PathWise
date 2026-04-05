import Foundation

struct AppNotification: Codable, Identifiable {
    let id: String
    let userId: String
    let type: String
    let title: String
    let body: String
    let read: Bool
    let createdAt: String
}

struct NotificationsResponse: Codable {
    let notifications: [AppNotification]
    let unreadCount: Int
}

struct MarkReadRequest: Codable {
    let userId: String
}
