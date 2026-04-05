import SwiftUI

struct NotificationsView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel: NotificationsViewModel?

    var body: some View {
        Group {
            if let vm = viewModel {
                content(vm)
            } else {
                LoadingView()
            }
        }
        .background(AppColors.offWhiteBg)
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let vm = viewModel, vm.unreadCount > 0 {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await vm.markAllRead() }
                    } label: {
                        Text("MARK ALL AS READ")
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(0.8)
                            .foregroundStyle(AppColors.primaryPurple)
                    }
                }
            }
        }
        .task {
            if let user = authManager.currentUser {
                let vm = NotificationsViewModel(api: authManager.apiClient, userId: user.id)
                viewModel = vm
                await vm.load()
            }
        }
    }

    // MARK: - Content

    @ViewBuilder
    private func content(_ vm: NotificationsViewModel) -> some View {
        if vm.isLoading {
            LoadingView()
        } else {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Today Section
                    if !vm.todayNotifications.isEmpty {
                        notificationSection(
                            title: "Today",
                            badge: "\(vm.todayNotifications.filter { !$0.read }.count) NEW",
                            showBadge: vm.todayNotifications.contains(where: { !$0.read }),
                            notifications: vm.todayNotifications,
                            showUnreadDot: true
                        )
                    }

                    // Earlier Section
                    if !vm.earlierNotifications.isEmpty {
                        notificationSection(
                            title: "Earlier",
                            badge: nil,
                            showBadge: false,
                            notifications: vm.earlierNotifications,
                            showUnreadDot: false
                        )
                    }

                    // Empty state
                    if vm.notifications.isEmpty {
                        emptyState
                    }

                    // End of feed footer
                    endOfFeedFooter
                }
                .padding(.horizontal, AppTheme.screenPadding)
                .padding(.vertical, 16)
            }
        }
    }

    // MARK: - Section

    private func notificationSection(
        title: String,
        badge: String?,
        showBadge: Bool,
        notifications: [AppNotification],
        showUnreadDot: Bool
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Text(title)
                    .font(AppTypography.title3)
                    .foregroundStyle(AppColors.darkText)
                if showBadge, let badge {
                    Text(badge)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(AppColors.tealAccent)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 3)
                        .background(AppColors.tealAccent.opacity(0.15), in: Capsule())
                }
                Spacer()
            }

            VStack(spacing: 10) {
                ForEach(notifications) { notification in
                    NotificationCard(notification: notification, showUnreadDot: showUnreadDot && !notification.read)
                }
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "bell.slash")
                .font(.system(size: 40))
                .foregroundStyle(AppColors.grayText.opacity(0.5))
            Text("No notifications yet")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }

    // MARK: - End of Feed

    private var endOfFeedFooter: some View {
        VStack(spacing: 6) {
            Image(systemName: "bell")
                .font(.system(size: 18))
                .foregroundStyle(AppColors.grayText.opacity(0.4))
            Text("END OF FEED")
                .capsStyle(size: 10, color: AppColors.grayText.opacity(0.5))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
    }
}

// MARK: - Notification Card

private struct NotificationCard: View {
    let notification: AppNotification
    let showUnreadDot: Bool

    private var accentColor: Color {
        switch notification.type {
        case "task_reminder": return AppColors.primaryPurple
        case "achievement": return AppColors.warningAmber
        case "streak": return Color.orange
        case "pathway_update": return AppColors.grayText
        case "weekly_wrap": return AppColors.grayText
        default: return AppColors.primaryPurple
        }
    }

    private var iconName: String {
        switch notification.type {
        case "task_reminder": return "bell.fill"
        case "achievement": return "trophy.fill"
        case "streak": return "flame.fill"
        case "pathway_update": return "checkmark.circle.fill"
        case "weekly_wrap": return "doc.text.fill"
        default: return "bell.fill"
        }
    }

    private var timestamp: String {
        guard let date = ISO8601DateFormatter().date(from: notification.createdAt) else {
            return notification.createdAt
        }
        let diff = Date().timeIntervalSince(date)
        if diff < 3600 {
            let mins = Int(diff / 60)
            return "\(max(1, mins))M AGO"
        } else if diff < 86400 {
            let hrs = Int(diff / 3600)
            return "\(hrs)H AGO"
        } else if diff < 172800 {
            return "YESTERDAY"
        } else {
            let days = Int(diff / 86400)
            return "\(days) DAYS AGO"
        }
    }

    var body: some View {
        HStack(spacing: 0) {
            // Colored left accent bar
            Rectangle()
                .fill(accentColor)
                .frame(width: 4)
                .clipShape(UnevenRoundedRectangle(
                    topLeadingRadius: AppTheme.cardRadius,
                    bottomLeadingRadius: AppTheme.cardRadius,
                    bottomTrailingRadius: 0,
                    topTrailingRadius: 0
                ))

            HStack(spacing: 12) {
                // Icon circle
                Circle()
                    .fill(accentColor.opacity(0.15))
                    .frame(width: 40, height: 40)
                    .overlay {
                        Image(systemName: iconName)
                            .font(.system(size: 16))
                            .foregroundStyle(accentColor)
                    }

                // Text content
                VStack(alignment: .leading, spacing: 4) {
                    Text(notification.title)
                        .font(AppTypography.headline)
                        .foregroundStyle(AppColors.darkText)
                    Text(notification.body)
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                        .lineLimit(2)
                    Text(timestamp)
                        .font(.system(size: 11, weight: .medium))
                        .tracking(0.5)
                        .foregroundStyle(AppColors.grayText.opacity(0.7))
                }

                Spacer()

                // Unread dot
                if showUnreadDot {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 10, height: 10)
                }
            }
            .padding(AppTheme.cardPadding)
        }
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        NotificationsView()
    }
    .environment(AuthManager())
}
