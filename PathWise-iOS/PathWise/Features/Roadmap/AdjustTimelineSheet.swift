import SwiftUI

struct AdjustTimelineSheet: View {
    @Bindable var vm: RoadmapViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Drag handle
                Capsule()
                    .fill(AppColors.lightGrayBorder)
                    .frame(width: 40, height: 5)
                    .padding(.top, 12)
                    .padding(.bottom, 8)

                ScrollView {
                    VStack(spacing: 20) {
                        headerSection
                        timelineOptions
                        infoLine
                        Spacer(minLength: 12)
                        ctaSection
                    }
                    .padding(.horizontal, AppTheme.screenPadding)
                    .padding(.bottom, 32)
                }
            }
            .background(.white)
            .navigationBarHidden(true)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.hidden)
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Adjust your timeline")
                .font(AppTypography.title2)
                .fontWeight(.bold)
                .foregroundStyle(AppColors.darkText)

            Text("Current: 6 months (Jan 2024 – July 2024)")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.primaryPurple)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    // MARK: - Timeline Options

    private var timelineOptions: some View {
        VStack(spacing: 12) {
            ForEach(TimelineOption.allCases) { option in
                timelineCard(option: option)
            }
        }
    }

    private func timelineCard(option: TimelineOption) -> some View {
        let isSelected = vm.selectedTimeline == option

        return Button {
            vm.selectedTimeline = option
        } label: {
            HStack(spacing: 14) {
                // Month badge
                VStack(spacing: 2) {
                    Text("\(option.months)m")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(isSelected ? AppColors.primaryPurple : AppColors.darkText)
                }
                .frame(width: 44)

                VStack(alignment: .leading, spacing: 3) {
                    Text(option.label)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(AppColors.darkText)
                    Text(option.weeklyHours)
                        .font(.system(size: 13))
                        .foregroundStyle(AppColors.grayText)
                }

                Spacer()

                HStack(spacing: 8) {
                    if option.isRecommended {
                        BadgeView(text: "RECOMMENDED", style: .current)
                    }
                    Image(systemName: option.iconName)
                        .font(.system(size: 16))
                        .foregroundStyle(isSelected ? AppColors.primaryPurple : AppColors.grayText)
                }
            }
            .padding(16)
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(
                        isSelected ? AppColors.primaryPurple : AppColors.lightGrayBorder,
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .shadow(color: isSelected ? AppColors.primaryPurple.opacity(0.12) : .black.opacity(0.04),
                    radius: isSelected ? 6 : 2, x: 0, y: 2)
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }

    // MARK: - Info Line

    private var infoLine: some View {
        HStack(spacing: 8) {
            Image(systemName: "info.circle.fill")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.tealAccent)
            Text("Estimated weekly time: ")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.grayText)
            + Text(vm.selectedTimeline.weeklyHours.components(separatedBy: " ").prefix(2).joined(separator: " "))
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(AppColors.darkText)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(AppColors.lavenderBg, in: RoundedRectangle(cornerRadius: 10))
    }

    // MARK: - CTA

    private var ctaSection: some View {
        VStack(spacing: 14) {
            PillButton(title: "Update Timeline", isLoading: vm.isLoading) {
                Task { await vm.updateTimeline() }
            }

            Button {
                dismiss()
            } label: {
                Text("Keep Current Settings")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(AppColors.darkText)
            }
        }
    }
}
