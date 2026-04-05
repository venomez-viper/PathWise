import SwiftUI

struct DashboardView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel: DashboardViewModel?

    var body: some View {
        ScrollView {
            if let vm = viewModel {
                if vm.isLoading {
                    LoadingView()
                } else if vm.hasAssessment {
                    postAssessmentContent(vm)
                } else {
                    preAssessmentContent
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
            ToolbarItem(placement: .topBarTrailing) {
                Circle().fill(AppColors.lightPurpleTint).frame(width: 32, height: 32)
                    .overlay { Text(String(authManager.currentUser?.name.prefix(1) ?? "?")).font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple) }
            }
        }
        .task {
            if let user = authManager.currentUser {
                let vm = DashboardViewModel(api: authManager.apiClient, userId: user.id)
                viewModel = vm
                await vm.load()
            }
        }
    }

    // MARK: - Pre-Assessment

    private var preAssessmentContent: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Welcome, \(authManager.currentUser?.name.components(separatedBy: " ").first ?? "")!")
                    .font(AppTypography.title1).foregroundStyle(AppColors.darkText)
                Text("Let's get started.").font(AppTypography.title1).foregroundStyle(AppColors.primaryPurple)
                Text("Your journey to career mastery begins with a quick assessment. Discover your strengths, find your ideal career path, and get a personalized roadmap.")
                    .font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                NavigationLink {
                    Text("Assessment") // Will be replaced with actual assessment flow
                } label: {
                    Text("Start Assessment")
                        .font(AppTypography.button).foregroundStyle(.white)
                        .padding(.horizontal, 24).padding(.vertical, 12)
                        .background(AppColors.darkText, in: Capsule())
                }
                .padding(.top, 4)
            }
            .padding(AppTheme.screenPadding)

            // Compass placeholder
            CardView(padding: 0) {
                RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                    .fill(LinearGradient(colors: [Color(hex: "334042"), Color(hex: "4a5759")], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(height: 200)
                    .overlay {
                        Image(systemName: "safari").font(.system(size: 64)).foregroundStyle(.white.opacity(0.5))
                    }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            // Locked content
            CardView {
                VStack(spacing: 12) {
                    Image(systemName: "lock.fill").font(.system(size: 24)).foregroundStyle(AppColors.primaryPurple)
                    Text("Complete assessment to unlock").font(AppTypography.headline).foregroundStyle(AppColors.primaryPurple)
                    Text("Gain access to your career analytics and AI matching").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                }
                .frame(maxWidth: .infinity)
            }
            .opacity(0.6)
            .padding(.horizontal, AppTheme.screenPadding)

            // Methodology
            CardView {
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 8) {
                        Image(systemName: "play.circle").foregroundStyle(AppColors.primaryPurple)
                        Text("The PathWise Methodology").font(AppTypography.headline).foregroundStyle(AppColors.darkText)
                    }
                    Text("Our AI analyzes over 15,000 career trajectories to map your unique professional DNA.")
                        .font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                    HStack(spacing: 8) {
                        HStack(spacing: 4) {
                            Image(systemName: "brain").font(.system(size: 12)).foregroundStyle(AppColors.primaryPurple)
                            Text("Cognitive Assessment").font(.system(size: 12)).foregroundStyle(AppColors.primaryPurple)
                        }
                        .padding(.horizontal, 10).padding(.vertical, 6).background(AppColors.lightPurpleTint, in: Capsule())
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.shield").font(.system(size: 12)).foregroundStyle(AppColors.primaryPurple)
                            Text("Skill Validation").font(.system(size: 12)).foregroundStyle(AppColors.primaryPurple)
                        }
                        .padding(.horizontal, 10).padding(.vertical, 6).background(AppColors.lightPurpleTint, in: Capsule())
                    }
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            // Fast-track banner
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Image(systemName: "bolt.fill").foregroundStyle(.white)
                    Text("Fast-Track Your Growth").font(AppTypography.title3).foregroundStyle(.white)
                }
                Text("Assessment takes less than 10 minutes and unlocks 100% of PathWise features.")
                    .font(AppTypography.callout).foregroundStyle(.white.opacity(0.9))
            }
            .padding(AppTheme.cardPadding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppColors.purpleGradient, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.bottom, 24)
        }
    }

    // MARK: - Post-Assessment

    private func postAssessmentContent(_ vm: DashboardViewModel) -> some View {
        VStack(spacing: 20) {
            // Welcome banner
            VStack(alignment: .leading, spacing: 12) {
                Text("Welcome back, \(authManager.currentUser?.name.components(separatedBy: " ").first ?? "")!")
                    .font(AppTypography.title3).foregroundStyle(.white)
                Text("Your journey to the top of your career is accelerating.")
                    .font(AppTypography.callout).foregroundStyle(.white.opacity(0.9))
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.circle.fill").font(.system(size: 12)).foregroundStyle(.white)
                    Text("CAREER ASSESSMENT 100% COMPLETED").capsStyle(size: 9, color: .white)
                }
                OutlinedButton(title: "VIEW MY ROADMAP", color: .white) {}
            }
            .padding(AppTheme.cardPadding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppColors.purpleGradient, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
            .padding(.horizontal, AppTheme.screenPadding)

            // Metric cards
            if let stats = vm.progressStats {
                metricCard(icon: "point.topleft.down.to.point.bottomright.curvepath", iconBg: AppColors.lightPurpleTint, label: "Roadmap Completion", value: "\(stats.roadmapCompletion)%", valueColor: AppColors.primaryPurple, progress: Double(stats.roadmapCompletion) / 100.0)
                metricCard(icon: "doc.text", iconBg: AppColors.lightPurpleTint, label: "Tasks Finished", value: String(format: "%02d", stats.tasksFinished), valueColor: AppColors.tealAccent, subtitle: "\(stats.tasksRemaining) tasks remaining this week")
                metricCard(icon: "star", iconBg: AppColors.warningAmber.opacity(0.15), label: "Job Readiness", value: "\(stats.jobReadinessScore)%", valueColor: AppColors.darkText, progress: Double(stats.jobReadinessScore) / 100.0, progressGradient: LinearGradient(colors: [AppColors.warningAmber, AppColors.amberGold], startPoint: .leading, endPoint: .trailing))
            }

            // Career matches
            if !vm.careerMatches.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Top Career Matches").font(AppTypography.title3).foregroundStyle(AppColors.darkText)
                    Text("Based on your skills and personality assessment").font(AppTypography.callout).foregroundStyle(AppColors.grayText)

                    ForEach(vm.careerMatches) { match in
                        CardView {
                            VStack(spacing: 12) {
                                CircularProgressView(progress: Double(match.matchScore) / 100.0, size: 70, lineWidth: 6, progressColor: AppColors.tealAccent)
                                Text(match.title).font(AppTypography.headline).foregroundStyle(AppColors.darkText)
                                Text(match.description).font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center)
                                OutlinedButton(title: "View Details") {}
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)
            }
        }
        .padding(.top, 8)
        .padding(.bottom, 24)
    }

    private func metricCard(icon: String, iconBg: Color, label: String, value: String, valueColor: Color, subtitle: String? = nil, progress: Double? = nil, progressGradient: LinearGradient? = nil) -> some View {
        CardView {
            HStack(spacing: 16) {
                Image(systemName: icon).font(.system(size: 20)).foregroundStyle(AppColors.primaryPurple)
                    .frame(width: 40, height: 40).background(iconBg, in: RoundedRectangle(cornerRadius: 10))
                VStack(alignment: .leading, spacing: 4) {
                    Text(label).font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                    if let subtitle { Text(subtitle).font(AppTypography.caption2).foregroundStyle(AppColors.grayText) }
                    if let progress { ProgressBarView(progress: progress, gradient: progressGradient ?? AppColors.progressGradient) }
                }
                Spacer()
                Text(value).font(AppTypography.title2).foregroundStyle(valueColor)
            }
        }
        .padding(.horizontal, AppTheme.screenPadding)
    }
}
