import SwiftUI

struct SettingsView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel = SettingsViewModel()
    @State private var showLogoutConfirm = false

    private var userName: String { authManager.currentUser?.name ?? "Member" }
    private var isPremium: Bool { authManager.currentUser?.plan.lowercased() == "premium" }

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.sectionSpacing) {
                profileCard
                goalTimelineCard
                assessmentCard
                premiumPlanCard
                preferencesSection
                navigationLinksSection
                logOutRow
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 16)
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
                avatarCircle
            }
        }
        .confirmationDialog("Log Out", isPresented: $showLogoutConfirm, titleVisibility: .visible) {
            Button("Log Out", role: .destructive) {
                viewModel.logout(authManager: authManager)
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to log out of PathWise?")
        }
    }

    // MARK: - Avatar

    private var avatarCircle: some View {
        Circle()
            .fill(AppColors.lightPurpleTint)
            .frame(width: 32, height: 32)
            .overlay {
                Text(String(userName.prefix(1)))
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(AppColors.primaryPurple)
            }
    }

    // MARK: - Profile Card

    private var profileCard: some View {
        CardView {
            VStack(alignment: .leading, spacing: 12) {
                // Premium badge
                Text(isPremium ? "PREMIUM MEMBER" : "FREE PLAN")
                    .capsStyle(size: 10, color: AppColors.primaryPurple)

                Text(userName)
                    .font(AppTypography.title1)
                    .foregroundStyle(AppColors.darkText)

                HStack(spacing: 6) {
                    Image(systemName: "target")
                        .font(.system(size: 13))
                        .foregroundStyle(AppColors.grayText)
                    Text("Marketing Analyst goal")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                }

                NavigationLink {
                    EditProfileView()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "pencil")
                        Text("Edit Profile")
                    }
                    .font(AppTypography.button)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: AppTheme.ctaHeight)
                    .background(AppColors.darkPurple, in: Capsule())
                }
            }
        }
    }

    // MARK: - Goal Timeline Card

    private var goalTimelineCard: some View {
        CardView {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("Goal Timeline")
                        .font(AppTypography.headline)
                        .foregroundStyle(AppColors.darkText)
                    Spacer()
                    Text("6 Months remaining")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.tealAccent)
                }
                ProgressBarView(progress: 0.5)
                HStack {
                    Text("STARTED JAN 2024")
                        .capsStyle(size: 9)
                    Spacer()
                    Text("TARGET JULY 2024")
                        .capsStyle(size: 9)
                }
            }
        }
    }

    // MARK: - Assessment Card

    private var assessmentCard: some View {
        CardView {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: "chart.bar.fill")
                    .font(.system(size: 18))
                    .foregroundStyle(AppColors.primaryPurple)
                    .frame(width: 40, height: 40)
                    .background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 6) {
                    Text("Assessment")
                        .font(AppTypography.headline)
                        .foregroundStyle(AppColors.darkText)
                    Text("Your latest skills evaluation shows strong analytical potential with growth areas in digital strategy.")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                    Button {
                        // Navigate to assessment retake
                    } label: {
                        HStack(spacing: 4) {
                            Text("Retake Assessment")
                                .font(AppTypography.callout)
                                .foregroundStyle(AppColors.primaryPurple)
                            Image(systemName: "arrow.right")
                                .font(.system(size: 12))
                                .foregroundStyle(AppColors.primaryPurple)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Premium Plan Card

    private var premiumPlanCard: some View {
        ZStack {
            RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                .fill(AppColors.purpleGradient)
                .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)

            // Decorative background star
            Image(systemName: "star.fill")
                .font(.system(size: 80))
                .foregroundStyle(.white.opacity(0.08))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
                .padding(.trailing, 16)

            VStack(alignment: .leading, spacing: 10) {
                Text("Premium Plan")
                    .font(AppTypography.title3)
                    .foregroundStyle(.white)
                Text("Access all advanced roadmaps, AI career coaching, and priority support.")
                    .font(AppTypography.callout)
                    .foregroundStyle(.white.opacity(0.9))
                Button {} label: {
                    Text("Upgrade Plan")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(Capsule().stroke(.white, lineWidth: 1.5))
                }
            }
            .padding(AppTheme.cardPadding)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Preferences Section

    private var preferencesSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Preferences")
                .font(AppTypography.headline)
                .foregroundStyle(AppColors.darkText)
                .padding(.bottom, 12)

            CardView(padding: 0) {
                VStack(spacing: 0) {
                    preferenceToggleRow(
                        icon: "bell.fill",
                        title: "Push Notifications",
                        subtitle: "Real-time alerts for task updates",
                        isOn: Binding(
                            get: { viewModel.pushNotifications },
                            set: { viewModel.savePushNotifications($0) }
                        )
                    )
                    Divider().padding(.horizontal, AppTheme.cardPadding)
                    preferenceToggleRow(
                        icon: "clock.fill",
                        title: "Daily Reminders",
                        subtitle: "Stay on track with 9:00 AM nudges",
                        isOn: Binding(
                            get: { viewModel.dailyReminders },
                            set: { viewModel.saveDailyReminders($0) }
                        )
                    )
                    Divider().padding(.horizontal, AppTheme.cardPadding)
                    preferenceToggleRow(
                        icon: "doc.text.fill",
                        title: "Weekly Reports",
                        subtitle: "Detailed progress insights via email",
                        isOn: Binding(
                            get: { viewModel.weeklyReports },
                            set: { viewModel.saveWeeklyReports($0) }
                        )
                    )
                }
            }
        }
    }

    private func preferenceToggleRow(icon: String, title: String, subtitle: String, isOn: Binding<Bool>) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(AppColors.primaryPurple)
                .frame(width: 36, height: 36)
                .background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.darkText)
                Text(subtitle)
                    .font(AppTypography.caption2)
                    .foregroundStyle(AppColors.grayText)
            }
            Spacer()
            Toggle("", isOn: isOn)
                .tint(AppColors.tealAccent)
                .labelsHidden()
        }
        .padding(.horizontal, AppTheme.cardPadding)
        .padding(.vertical, 14)
    }

    // MARK: - Navigation Links Section

    private var navigationLinksSection: some View {
        CardView(padding: 0) {
            VStack(spacing: 0) {
                NavigationLink {
                    ChangeTargetRoleView()
                } label: {
                    navLinkRow(
                        icon: "target",
                        title: "Change Target Role",
                        subtitle: "Current: Marketing Analyst"
                    )
                }
                Divider().padding(.horizontal, AppTheme.cardPadding)
                Button {} label: {
                    navLinkRow(icon: "shield.fill", title: "Security & Privacy", subtitle: nil)
                }
            }
        }
    }

    private func navLinkRow(icon: String, title: String, subtitle: String?) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(AppColors.primaryPurple)
                .frame(width: 36, height: 36)
                .background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.darkText)
                if let subtitle {
                    Text(subtitle)
                        .font(AppTypography.caption2)
                        .foregroundStyle(AppColors.grayText)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.grayText)
        }
        .padding(.horizontal, AppTheme.cardPadding)
        .padding(.vertical, 14)
    }

    // MARK: - Log Out

    private var logOutRow: some View {
        Button {
            showLogoutConfirm = true
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 16))
                    .foregroundStyle(AppColors.errorRed)
                Text("Log Out")
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.errorRed)
                Spacer()
            }
            .padding(.horizontal, AppTheme.cardPadding)
            .padding(.vertical, 14)
            .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
            .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
        }
        .padding(.bottom, 8)
    }
}
