import SwiftUI

struct StreakTrackerView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel: StreaksViewModel?

    private let dayLabels = ["M", "T", "W", "T", "F", "S", "S"]

    var body: some View {
        Group {
            if let vm = viewModel {
                if vm.isLoading {
                    LoadingView()
                } else {
                    streakContent(vm)
                }
            } else {
                LoadingView()
            }
        }
        .background(AppColors.offWhiteBg)
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
                let vm = StreaksViewModel(api: authManager.apiClient, userId: user.id)
                viewModel = vm
                await vm.load()
            }
        }
    }

    private func streakContent(_ vm: StreaksViewModel) -> some View {
        ScrollView {
            VStack(spacing: AppTheme.sectionSpacing) {
                // Heading
                VStack(spacing: 6) {
                    Text("Momentum")
                        .font(AppTypography.largeTitle)
                        .foregroundStyle(AppColors.darkText)
                    Text("You're building momentum!")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 8)

                // Streak Card
                CardView {
                    // Streak header
                    HStack(spacing: 14) {
                        ZStack {
                            Circle()
                                .fill(AppColors.tealAccent.opacity(0.15))
                                .frame(width: 56, height: 56)
                            Image(systemName: "flame.fill")
                                .font(.system(size: 26))
                                .foregroundStyle(AppColors.tealAccent)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Text("🔥")
                                    .font(.system(size: 24))
                                Text("\(vm.streak?.currentStreak ?? 0)-day streak")
                                    .font(.system(size: 26, weight: .bold))
                                    .foregroundStyle(AppColors.darkText)
                            }
                            Text("YOUR BEST: \(vm.streak?.bestStreak ?? 0) DAYS")
                                .capsStyle(size: 11, color: AppColors.grayText)
                        }
                    }

                    Divider().padding(.vertical, 4)

                    // Weekly Progress header
                    HStack {
                        Text("WEEKLY PROGRESS")
                            .capsStyle(size: 11, color: AppColors.darkText)
                        Spacer()
                        Text("\(vm.weeklyCompletionPercent)% Complete")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(AppColors.tealAccent)
                    }

                    // Day circles
                    HStack(spacing: 0) {
                        ForEach(Array(dayLabels.enumerated()), id: \.offset) { index, label in
                            dayCircle(
                                label: label,
                                index: index,
                                weeklyProgress: vm.streak?.weeklyProgress ?? []
                            )
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .padding(.top, 4)
                }

                // Power Hour Card
                powerHourCard

                // Consistency Card
                CardView {
                    HStack {
                        Text("Consistency")
                            .font(AppTypography.headline)
                            .foregroundStyle(AppColors.darkText)
                        Image(systemName: "chart.line.uptrend.xyaxis")
                            .font(.system(size: 14))
                            .foregroundStyle(AppColors.tealAccent)
                        Spacer()
                    }

                    HStack {
                        Text("Consistency Score")
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.grayText)
                        Spacer()
                        Text("\(vm.streak?.consistencyScore ?? 0)%")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundStyle(AppColors.darkText)
                    }

                    ProgressBarView(
                        progress: Double(vm.streak?.consistencyScore ?? 0) / 100.0,
                        height: 8,
                        gradient: LinearGradient(
                            colors: [AppColors.tealAccent, AppColors.tealLight],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                }

                // CTA
                PillButton(
                    title: "Complete Today's Tasks",
                    icon: "sparkles",
                    isLoading: vm.isRecording,
                    gradient: LinearGradient(
                        colors: [Color(hex: "0D9488"), AppColors.tealAccent],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                ) {
                    Task { await vm.recordActivity() }
                }
                .padding(.bottom, 8)
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.bottom, AppTheme.screenPadding)
        }
    }

    @ViewBuilder
    private func dayCircle(label: String, index: Int, weeklyProgress: [Bool]) -> some View {
        let isToday = (index == currentDayIndex())
        let isCompleted = index < weeklyProgress.count && weeklyProgress[index]
        let isMissed = index < weeklyProgress.count && !weeklyProgress[index] && !isToday && index < currentDayIndex()

        VStack(spacing: 6) {
            Text(label)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(AppColors.grayText)

            if isToday {
                // Today: larger teal circle with lightning bolt and ring
                ZStack {
                    Circle()
                        .stroke(AppColors.tealAccent, lineWidth: 2)
                        .frame(width: 40, height: 40)
                    Circle()
                        .fill(AppColors.tealAccent)
                        .frame(width: 36, height: 36)
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(.white)
                }
            } else if isCompleted {
                // Completed: teal circle with white checkmark
                ZStack {
                    Circle()
                        .fill(AppColors.tealAccent)
                        .frame(width: 32, height: 32)
                    Image(systemName: "checkmark")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(.white)
                }
            } else if isMissed {
                // Missed: gray circle
                Circle()
                    .fill(AppColors.lightGrayBorder)
                    .frame(width: 32, height: 32)
            } else {
                // Upcoming: empty gray circle
                Circle()
                    .stroke(AppColors.lightGrayBorder, lineWidth: 1.5)
                    .frame(width: 32, height: 32)
            }
        }
    }

    private var powerHourCard: some View {
        ZStack {
            // Background gradient
            RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "5B21B6"), Color(hex: "7C3AED")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            // Decorative clock icon
            Image(systemName: "clock.fill")
                .font(.system(size: 90))
                .foregroundStyle(.white.opacity(0.08))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
                .padding(.trailing, 16)

            VStack(alignment: .leading, spacing: 8) {
                Text("Power Hour")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(.white)

                Text("You're most active at 9:00 AM. Keep the morning momentum!")
                    .font(AppTypography.callout)
                    .foregroundStyle(.white.opacity(0.9))
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(AppTheme.cardPadding)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(minHeight: 110)
        .shadow(color: AppColors.primaryPurple.opacity(0.3), radius: 8, x: 0, y: 4)
    }

    private func currentDayIndex() -> Int {
        // Calendar weekday: 1=Sun, 2=Mon ... 7=Sat; map to M=0..S=6
        let weekday = Calendar.current.component(.weekday, from: Date())
        return (weekday + 5) % 7
    }
}
