import SwiftUI

struct AssessmentQuestionView: View {
    @Bindable var viewModel: AssessmentViewModel

    var body: some View {
        let question = viewModel.currentQuestion!

        VStack(spacing: 20) {
            // Progress
            VStack(spacing: 8) {
                HStack {
                    Text("\(question.category) — Question \(viewModel.currentStep + 1)")
                        .font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                    Spacer()
                    Text("\(viewModel.currentStep + 1) OF \(viewModel.totalQuestions)")
                        .font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                }
                ProgressBarView(progress: Double(viewModel.currentStep + 1) / Double(viewModel.totalQuestions))
            }

            Text(question.text).font(AppTypography.title2).foregroundStyle(AppColors.darkText).frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 12) {
                ForEach(Array(question.options.enumerated()), id: \.offset) { index, option in
                    let isSelected = viewModel.selectedOptions[viewModel.currentStep] == index
                    Button { viewModel.selectOption(index) } label: {
                        HStack(spacing: 16) {
                            Image(systemName: option.icon)
                                .font(.system(size: 20))
                                .foregroundStyle(AppColors.primaryPurple)
                                .frame(width: 40, height: 40)
                                .background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 10))
                            Text(option.text).font(AppTypography.body).foregroundStyle(AppColors.darkText)
                            Spacer()
                            if isSelected {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 22)).foregroundStyle(AppColors.tealAccent)
                            }
                        }
                        .padding(16)
                        .background(.white, in: RoundedRectangle(cornerRadius: 16))
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(isSelected ? AppColors.primaryPurple : Color.clear, lineWidth: 2))
                        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
                    }
                }
            }

            Spacer()

            PillButton(title: "Continue", icon: "arrow.right", disabled: !viewModel.canContinue) { viewModel.next() }
        }
        .padding(AppTheme.screenPadding)
        .background(AppColors.offWhiteBg)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                if viewModel.currentStep > 0 {
                    Button { viewModel.previous() } label: {
                        HStack(spacing: 4) { Image(systemName: "chevron.left"); Text("BACK") }
                            .font(.system(size: 12, weight: .semibold)).foregroundStyle(AppColors.darkText)
                    }
                }
            }
        }
    }
}
