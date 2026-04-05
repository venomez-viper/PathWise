import SwiftUI

struct ChangeTargetRoleView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var selectedRole: String? = nil

    private struct RoleOption: Identifiable {
        let id = UUID()
        let icon: String
        let title: String
        let matchPercent: Int
    }

    private let availableRoles: [RoleOption] = [
        RoleOption(icon: "chart.bar.fill", title: "Data Analyst", matchPercent: 92),
        RoleOption(icon: "person.3.fill", title: "Product Manager", matchPercent: 85)
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.sectionSpacing) {
                headerSection
                warningCard
                currentRoleSection
                newRoleSection
                changeRoleButton
                disclaimerText
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 16)
        }
        .background(AppColors.offWhiteBg)
        .navigationTitle("Change Target Role")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button { dismiss() } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.darkText)
                }
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Pivot your career trajectory by selecting a new target role from your assessment matches.")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
        }
    }

    // MARK: - Warning Card

    private var warningCard: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 18))
                .foregroundStyle(AppColors.warningAmber)

            VStack(alignment: .leading, spacing: 6) {
                Text("Changing role will reset roadmap")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
                Text("Switching roles will archive your current progress and generate a completely new learning path based on the selected role's requirements.")
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
            }
        }
        .padding(AppTheme.cardPadding)
        .background(AppColors.warningAmber.opacity(0.1), in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
    }

    // MARK: - Current Role

    private var currentRoleSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("CURRENT ROLE")
                .capsStyle(size: 11, color: AppColors.primaryPurple)

            HStack(spacing: 14) {
                Image(systemName: "target")
                    .font(.system(size: 18))
                    .foregroundStyle(AppColors.primaryPurple)
                    .frame(width: 40, height: 40)
                    .background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 4) {
                    Text("Marketing Analyst")
                        .font(AppTypography.headline)
                        .foregroundStyle(AppColors.darkText)
                    Text("Active Roadmap - 45% Complete")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                }
                Spacer()
                // CURRENT badge
                Text("CURRENT")
                    .capsStyle(size: 9, color: AppColors.tealAccent)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(AppColors.tealAccent.opacity(0.15), in: Capsule())
            }
            .padding(AppTheme.cardPadding)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                    .fill(.white)
                    .overlay(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(AppColors.primaryPurple)
                            .frame(width: 4)
                    }
            )
            .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
        }
    }

    // MARK: - New Role Selection

    private var newRoleSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("SELECT NEW ROLE")
                .capsStyle(size: 11, color: AppColors.primaryPurple)

            VStack(spacing: 12) {
                ForEach(availableRoles) { role in
                    roleOptionCard(role)
                }
            }
        }
    }

    private func roleOptionCard(_ role: RoleOption) -> some View {
        let isSelected = selectedRole == role.title
        return Button {
            selectedRole = role.title
        } label: {
            HStack(spacing: 14) {
                Image(systemName: role.icon)
                    .font(.system(size: 18))
                    .foregroundStyle(AppColors.primaryPurple)
                    .frame(width: 40, height: 40)
                    .background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 4) {
                    Text(role.title)
                        .font(AppTypography.headline)
                        .foregroundStyle(AppColors.darkText)
                    Text("\(role.matchPercent)% Match with your skills")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                }
                Spacer()
                // Radio button
                ZStack {
                    Circle()
                        .stroke(isSelected ? AppColors.primaryPurple : AppColors.lightGrayBorder, lineWidth: 2)
                        .frame(width: 22, height: 22)
                    if isSelected {
                        Circle()
                            .fill(AppColors.primaryPurple)
                            .frame(width: 12, height: 12)
                    }
                }
            }
            .padding(AppTheme.cardPadding)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                    .fill(.white)
                    .overlay {
                        if isSelected {
                            RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                                .stroke(AppColors.primaryPurple, lineWidth: 1.5)
                        }
                    }
            )
            .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }

    // MARK: - CTA

    private var changeRoleButton: some View {
        Button {
            // Trigger role change confirmation
        } label: {
            HStack(spacing: 8) {
                Text("Change Target Role")
                    .font(AppTypography.button)
                    .foregroundStyle(selectedRole != nil ? AppColors.primaryPurple : AppColors.grayText)
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(selectedRole != nil ? AppColors.primaryPurple : AppColors.grayText)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(
                Capsule()
                    .stroke(selectedRole != nil ? AppColors.primaryPurple : AppColors.lightGrayBorder, lineWidth: 1.5)
            )
        }
        .disabled(selectedRole == nil)
    }

    // MARK: - Disclaimer

    private var disclaimerText: some View {
        Text("By confirming, you agree to reset your current dashboard and start a new training sequence for the selected role.")
            .font(AppTypography.caption2)
            .foregroundStyle(AppColors.grayText)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .padding(.bottom, 16)
    }
}
