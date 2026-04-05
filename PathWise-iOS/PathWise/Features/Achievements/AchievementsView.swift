import SwiftUI

struct AchievementsView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel: AchievementsViewModel?

    private let columns = [
        GridItem(.flexible(), spacing: 14),
        GridItem(.flexible(), spacing: 14)
    ]

    var body: some View {
        Group {
            if let vm = viewModel {
                if vm.isLoading {
                    LoadingView()
                } else {
                    achievementsContent(vm)
                }
            } else {
                LoadingView()
            }
        }
        .background(AppColors.lavenderBg)
        .navigationTitle("")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                HStack(spacing: 6) {
                    Image(systemName: "book.fill").foregroundStyle(AppColors.primaryPurple)
                    Text("PathWise").font(.system(size: 18, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                }
            }
        }
        .task {
            if let user = authManager.currentUser {
                let vm = AchievementsViewModel(api: authManager.apiClient, userId: user.id)
                viewModel = vm
                await vm.load()
            }
        }
    }

    private func achievementsContent(_ vm: AchievementsViewModel) -> some View {
        ScrollView {
            VStack(spacing: AppTheme.sectionSpacing) {
                // Heading
                VStack(alignment: .leading, spacing: 8) {
                    Text("Your Achievements")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(AppColors.darkText)
                    Text("Celebrating your growth and professional milestones. Each badge represents a step closer to your career goals.")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.top, 4)

                // Season Progress Card
                if let season = vm.seasonProgress {
                    seasonProgressCard(season: season, progress: vm.seasonXpProgress)
                }

                // Badge Count
                VStack(spacing: 6) {
                    Image(systemName: "pin.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(AppColors.primaryPurple)
                    Text("\(vm.earnedCount)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundStyle(AppColors.darkText)
                    Text("TOTAL BADGES")
                        .capsStyle(size: 11, color: AppColors.grayText)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)

                // Badges Grid
                if !vm.achievements.isEmpty {
                    LazyVGrid(columns: columns, spacing: 14) {
                        ForEach(vm.earnedAchievements) { badge in
                            earnedBadgeCard(badge)
                        }
                        ForEach(vm.lockedAchievements) { badge in
                            lockedBadgeCard(badge)
                        }
                    }
                } else {
                    emptyState
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.bottom, AppTheme.screenPadding)
        }
    }

    private func seasonProgressCard(season: SeasonProgress, progress: Double) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "3B0764"), Color(hex: "5B21B6")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: 12) {
                Text("SEASON PROGRESS")
                    .capsStyle(size: 10, color: .white.opacity(0.7))

                Text("\(season.tier) Achieved")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(.white)

                Text("\(season.currentXp) / \(season.nextLevelXp) XP to next level")
                    .font(AppTypography.callout)
                    .foregroundStyle(.white.opacity(0.9))

                // Green XP progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(.white.opacity(0.2))
                            .frame(height: 8)
                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [AppColors.successGreenLight, AppColors.successGreen],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: max(0, geo.size.width * progress), height: 8)
                            .animation(.easeOut(duration: 0.8), value: progress)
                    }
                }
                .frame(height: 8)
            }
            .padding(AppTheme.cardPadding)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .shadow(color: AppColors.darkPurple.opacity(0.35), radius: 8, x: 0, y: 4)
    }

    private func earnedBadgeCard(_ badge: AchievementData) -> some View {
        CardView(padding: 14) {
            VStack(alignment: .leading, spacing: 8) {
                ZStack {
                    Circle()
                        .fill(badgeColor(for: badge.badgeKey).opacity(0.15))
                        .frame(width: 48, height: 48)
                    Image(systemName: badgeIcon(for: badge.badgeKey))
                        .font(.system(size: 22))
                        .foregroundStyle(badgeColor(for: badge.badgeKey))
                }

                Text(badge.title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(AppColors.darkText)
                    .lineLimit(2)

                Text(badge.description)
                    .font(.system(size: 11, weight: .regular))
                    .foregroundStyle(AppColors.grayText)
                    .lineLimit(3)

                if let earnedAt = badge.earnedAt {
                    Text("EARNED \(formattedDate(earnedAt))")
                        .capsStyle(size: 9, color: AppColors.successGreen)
                }
            }
        }
    }

    private func lockedBadgeCard(_ badge: AchievementData) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            VStack(alignment: .leading, spacing: 8) {
                ZStack {
                    Circle()
                        .fill(AppColors.lightGrayBorder)
                        .frame(width: 48, height: 48)
                    Image(systemName: badgeIcon(for: badge.badgeKey))
                        .font(.system(size: 22))
                        .foregroundStyle(AppColors.grayText)
                }

                Text(badge.title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(AppColors.grayText)
                    .lineLimit(2)

                Text("REQUIREMENT")
                    .capsStyle(size: 9, color: AppColors.grayText)

                Text(badge.description)
                    .font(.system(size: 11, weight: .regular))
                    .foregroundStyle(AppColors.grayText)
                    .lineLimit(3)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white.opacity(0.6), in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                    .stroke(AppColors.lightGrayBorder, lineWidth: 1)
            )
        }
        .opacity(0.75)
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "trophy.fill")
                .font(.system(size: 48))
                .foregroundStyle(AppColors.lightGrayBorder)
            Text("No achievements yet")
                .font(AppTypography.headline)
                .foregroundStyle(AppColors.grayText)
            Text("Complete tasks and milestones to earn your first badge.")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .padding(.top, 40)
    }

    // MARK: - Helpers

    private func badgeColor(for key: String) -> Color {
        let k = key.lowercased()
        if k.contains("streak") { return AppColors.amberGold }
        if k.contains("roadmap") || k.contains("path") { return AppColors.tealAccent }
        if k.contains("skill") { return AppColors.primaryPurple }
        if k.contains("network") { return Color(hex: "3B82F6") }
        if k.contains("interview") { return Color(hex: "EC4899") }
        if k.contains("first") || k.contains("step") { return Color(hex: "3B82F6") }
        return AppColors.primaryPurple
    }

    private func badgeIcon(for key: String) -> String {
        let k = key.lowercased()
        if k.contains("streak") { return "flame.fill" }
        if k.contains("roadmap") { return "diamond.fill" }
        if k.contains("path") { return "map.fill" }
        if k.contains("skill") { return "star.fill" }
        if k.contains("network") { return "person.2.fill" }
        if k.contains("interview") { return "mic.fill" }
        if k.contains("first") || k.contains("step") { return "flag.fill" }
        if k.contains("contributor") { return "square.and.arrow.up.fill" }
        return "rosette"
    }

    private func formattedDate(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: iso) {
            let display = DateFormatter()
            display.dateFormat = "MMM d"
            return display.string(from: date).uppercased()
        }
        // Fallback: try without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: iso) {
            let display = DateFormatter()
            display.dateFormat = "MMM d"
            return display.string(from: date).uppercased()
        }
        return iso
    }
}
