import SwiftUI

struct TaskCelebrationView: View {
    let userName: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "trophy.fill").font(.system(size: 48)).foregroundStyle(AppColors.tealAccent)

            VStack(spacing: 8) {
                Text("Great work, \(userName)!").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
                Text("You've completed all tasks for today.").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
            }

            HStack(spacing: 16) {
                CardView {
                    VStack(spacing: 8) {
                        Image(systemName: "chart.line.uptrend.xyaxis").foregroundStyle(AppColors.tealAccent)
                        Text("+5% job readiness").font(.system(size: 12, weight: .bold)).foregroundStyle(AppColors.tealAccent)
                    }
                    .frame(maxWidth: .infinity)
                }
                CardView {
                    VStack(spacing: 8) {
                        Image(systemName: "flame.fill").foregroundStyle(AppColors.warningAmber)
                        Text("4 day streak").font(.system(size: 12, weight: .bold)).foregroundStyle(AppColors.darkText)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            CardView {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("WEEKLY GOAL").capsStyle(size: 10)
                        Spacer()
                        Text("85%").font(.system(size: 16, weight: .bold)).foregroundStyle(AppColors.tealAccent)
                    }
                    Text("Mid-Week Milestone").font(AppTypography.headline).foregroundStyle(AppColors.darkText)
                    ProgressBarView(progress: 0.85)
                    Text("Only 2 more tasks to reach your weekly personal best!")
                        .font(.system(size: 12)).italic().foregroundStyle(AppColors.grayText)
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            PillButton(title: "View Tomorrow's Tasks") { dismiss() }.padding(.horizontal, AppTheme.screenPadding)
            Button("Back to Home") { dismiss() }
                .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.primaryPurple)

            Spacer()
        }
        .background(.white)
    }
}
