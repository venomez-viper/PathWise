import SwiftUI

struct AboutYouView: View {
    @Binding var currentRole: String
    @Binding var experience: String
    @Binding var education: String
    @Binding var selectedIndustries: Set<String>
    let onContinue: () -> Void
    let onSkip: () -> Void

    private let industries = ["Tech", "Marketing", "Finance", "Healthcare", "Education", "Design"]
    private let experienceOptions = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"]
    private let educationOptions = ["High School", "Associate's", "Bachelor's", "Master's", "PhD"]

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Progress
                VStack(spacing: 8) {
                    HStack {
                        Text("STEP 1 OF 2").capsStyle(size: 10, color: AppColors.primaryPurple)
                        Spacer()
                        Text("50% Complete").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                    }
                    ProgressBarView(progress: 0.5)
                }
                .padding(.horizontal, AppTheme.screenPadding)

                CardView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text("Tell us about yourself").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
                        Text("Help us customize your career roadmap by sharing your professional background.").font(AppTypography.callout).foregroundStyle(AppColors.grayText)

                        InputField(label: "Current role", icon: "briefcase", placeholder: "e.g. Product Designer", text: $currentRole)

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Experience").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                            Menu {
                                ForEach(experienceOptions, id: \.self) { opt in
                                    Button(opt) { experience = opt }
                                }
                            } label: {
                                HStack {
                                    Text(experience.isEmpty ? "Select years" : experience)
                                        .foregroundStyle(experience.isEmpty ? AppColors.grayText : AppColors.darkText)
                                    Spacer()
                                    Image(systemName: "chevron.down").foregroundStyle(AppColors.grayText)
                                }
                                .font(AppTypography.body)
                                .padding(.horizontal, 16)
                                .frame(height: AppTheme.inputHeight)
                                .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
                            }
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Education").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                            Menu {
                                ForEach(educationOptions, id: \.self) { opt in
                                    Button(opt) { education = opt }
                                }
                            } label: {
                                HStack {
                                    Text(education.isEmpty ? "Highest level" : education)
                                        .foregroundStyle(education.isEmpty ? AppColors.grayText : AppColors.darkText)
                                    Spacer()
                                    Image(systemName: "chevron.down").foregroundStyle(AppColors.grayText)
                                }
                                .font(AppTypography.body)
                                .padding(.horizontal, 16)
                                .frame(height: AppTheme.inputHeight)
                                .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
                            }
                        }

                        VStack(alignment: .leading, spacing: 8) {
                            Text("Industry").font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                            FlowLayout(spacing: 8) {
                                ForEach(industries, id: \.self) { industry in
                                    ChipView(title: industry, isSelected: selectedIndustries.contains(industry)) {
                                        if selectedIndustries.contains(industry) { selectedIndustries.remove(industry) }
                                        else { selectedIndustries.insert(industry) }
                                    }
                                }
                            }
                        }

                        PillButton(title: "Continue", icon: "arrow.right") { onContinue() }
                        Button("Skip for now") { onSkip() }
                            .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.primaryPurple)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                MentorTipCard(
                    title: "Ethereal Mentor Tip",
                    message: "Completing your profile now increases career match accuracy by 85%. You can always update this later."
                )
                .padding(.horizontal, AppTheme.screenPadding)
            }
            .padding(.top, 16)
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
    }
}

// Simple flow layout for chips
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: ProposedViewSize(width: bounds.width, height: bounds.height), subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (positions, CGSize(width: maxWidth, height: y + rowHeight))
    }
}
