import SwiftUI

struct ProgressDashboardView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel: ProgressViewModel?

    var body: some View {
        ScrollView {
            if let vm = viewModel, let stats = vm.stats {
                VStack(spacing: 20) {
                    // Hero card with large donut
                    CardView {
                        VStack(spacing: 16) {
                            CircularProgressView(progress: Double(stats.jobReadinessScore) / 100.0, size: 160, lineWidth: 14, progressColor: AppColors.tealAccent)

                            Text("Overall Job Readiness").font(AppTypography.title2).foregroundStyle(AppColors.primaryPurple)

                            Text("You're making exceptional progress! Your profile strength is in the top 15% of aspiring professionals this month.")
                                .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center)

                            HStack(spacing: 6) {
                                Image(systemName: "chart.line.uptrend.xyaxis").font(.system(size: 12))
                                Text("+12% from last week").font(.system(size: 12, weight: .medium))
                            }
                            .foregroundStyle(AppColors.primaryPurple)
                            .padding(.horizontal, 12).padding(.vertical, 6)
                            .background(AppColors.lightPurpleTint, in: Capsule())
                        }
                        .frame(maxWidth: .infinity)
                    }

                    // Tasks summary
                    CardView {
                        HStack(spacing: 16) {
                            Image(systemName: "doc.text").font(.system(size: 20)).foregroundStyle(AppColors.primaryPurple)
                                .frame(width: 40, height: 40).background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 10))
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Tasks Summary").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                                Text("\(stats.tasksRemaining) tasks remaining this week").font(AppTypography.caption2).foregroundStyle(AppColors.grayText)
                                ProgressBarView(progress: stats.tasksFinished > 0 ? Double(stats.tasksFinished) / Double(stats.tasksFinished + stats.tasksRemaining) : 0)
                            }
                            Spacer()
                            Text("\(stats.tasksFinished) / \(stats.tasksFinished + stats.tasksRemaining)")
                                .font(AppTypography.title2).foregroundStyle(AppColors.darkText)
                        }
                    }

                    // Roadmap completion
                    CardView {
                        HStack(spacing: 16) {
                            Image(systemName: "point.topleft.down.to.point.bottomright.curvepath")
                                .font(.system(size: 20)).foregroundStyle(AppColors.tealAccent)
                                .frame(width: 40, height: 40).background(AppColors.tealAccent.opacity(0.1), in: RoundedRectangle(cornerRadius: 10))
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Roadmap Completion").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                                Text("Level 2: Strategic Specialist").font(AppTypography.caption2).foregroundStyle(AppColors.grayText)
                                ProgressBarView(progress: Double(stats.roadmapCompletion) / 100.0)
                            }
                            Spacer()
                            Text("\(stats.roadmapCompletion)%").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
                        }
                    }

                    // Skill roadmap progress
                    if let breakdown = stats.breakdown {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Skill Roadmap Progress").font(AppTypography.title3).foregroundStyle(AppColors.darkText)

                            skillBar("Milestone Progress", percent: breakdown.milestoneProgress)
                            skillBar("Task Completion", percent: breakdown.taskCompletion)
                            skillBar("Category Balance", percent: breakdown.categoryBalance)
                            skillBar("Momentum", percent: breakdown.momentum)
                        }
                    }
                }
                .padding(AppTheme.screenPadding)
            } else {
                LoadingView()
            }
        }
        .background(AppColors.lavenderBg)
        .navigationTitle("Progress")
        .task {
            if let user = authManager.currentUser {
                let vm = ProgressViewModel(api: authManager.apiClient, userId: user.id)
                viewModel = vm
                await vm.load()
            }
        }
    }

    private func skillBar(_ label: String, percent: Int) -> some View {
        CardView {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(label).font(AppTypography.callout).foregroundStyle(AppColors.darkText)
                    Spacer()
                    Text("\(percent)%").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                }
                ProgressBarView(progress: Double(percent) / 100.0)
            }
        }
    }
}
