import SwiftUI

struct YourGoalsView: View {
    @Binding var selectedRole: String
    @Binding var selectedTimeline: String
    @Binding var selectedValues: Set<String>
    let onContinue: () -> Void
    let onSkip: () -> Void

    private let roles = ["Product Manager", "UX Designer", "Data Scientist", "Marketing Lead", "Software Architect"]
    private let timelines = ["3m", "6m", "1y", "Not sure"]
    private let valueItems = [
        ("SALARY", "dollarsign.circle"), ("GROWTH", "chart.line.uptrend.xyaxis"),
        ("BALANCE", "scale.3d"), ("IMPACT", "star")
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    HStack {
                        Text("STEP 2 OF 2").capsStyle(size: 10, color: AppColors.primaryPurple)
                        Spacer()
                        Text("COMPLETION: 100%").capsStyle(size: 10, color: AppColors.tealAccent)
                    }
                    ProgressBarView(progress: 1.0)
                }
                .padding(.horizontal, AppTheme.screenPadding)

                VStack(spacing: 8) {
                    Text("What are your career goals?").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
                    Text("Let's map out where you want to go. We'll use this to tailor your daily roadmap.")
                        .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center)
                }
                .padding(.horizontal, AppTheme.screenPadding)

                // Section 01: Role
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 4) {
                        Text("01.").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                        Text("I want to become a...").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                    }
                    FlowLayout(spacing: 8) {
                        ForEach(roles, id: \.self) { role in
                            ChipView(title: role, isSelected: selectedRole == role) { selectedRole = role }
                        }
                        ChipView(title: "+ Other", isSelected: false, icon: "plus") {}
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                // Section 02: Timeline
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 4) {
                        Text("02.").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                        Text("Target timeline").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                    }
                    HStack(spacing: 12) {
                        ForEach(timelines, id: \.self) { tl in
                            Button { selectedTimeline = tl } label: {
                                Text(tl)
                                    .font(.system(size: 14, weight: selectedTimeline == tl ? .bold : .regular))
                                    .foregroundStyle(selectedTimeline == tl ? AppColors.primaryPurple : AppColors.grayText)
                                    .frame(width: tl == "Not sure" ? 70 : 44, height: 44)
                                    .overlay(Circle().stroke(selectedTimeline == tl ? AppColors.primaryPurple : AppColors.lightGrayBorder, lineWidth: selectedTimeline == tl ? 2 : 1).opacity(tl == "Not sure" ? 0 : 1))
                                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(selectedTimeline == tl ? AppColors.primaryPurple : AppColors.lightGrayBorder, lineWidth: selectedTimeline == tl ? 2 : 1).opacity(tl == "Not sure" ? 1 : 0))
                            }
                        }
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                // Section 03: Values
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 4) {
                        Text("03.").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                        Text("What matters most?").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                    }
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(valueItems, id: \.0) { item in
                            let isSelected = selectedValues.contains(item.0)
                            Button {
                                if isSelected { selectedValues.remove(item.0) } else { selectedValues.insert(item.0) }
                            } label: {
                                VStack(spacing: 8) {
                                    Image(systemName: item.1).font(.system(size: 24))
                                    Text(item.0).font(.system(size: 12, weight: .semibold)).tracking(0.5)
                                }
                                .frame(maxWidth: .infinity).frame(height: 80)
                                .foregroundStyle(isSelected ? AppColors.tealAccent : AppColors.grayText)
                                .background(isSelected ? AppColors.tealAccent.opacity(0.1) : .white, in: RoundedRectangle(cornerRadius: 16))
                                .overlay(RoundedRectangle(cornerRadius: 16).stroke(isSelected ? AppColors.tealAccent : AppColors.lightGrayBorder, lineWidth: isSelected ? 2 : 1))
                            }
                        }
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                PillButton(title: "Start My Assessment", icon: "arrow.right") { onContinue() }
                    .padding(.horizontal, AppTheme.screenPadding)
                Button("Skip for now") { onSkip() }
                    .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.primaryPurple)
            }
            .padding(.top, 16)
        }
        .background(AppColors.lavenderBg)
    }
}
