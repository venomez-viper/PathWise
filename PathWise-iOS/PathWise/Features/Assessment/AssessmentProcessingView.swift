import SwiftUI

struct AssessmentProcessingView: View {
    @Bindable var viewModel: AssessmentViewModel
    @State private var rotation: Double = 0
    let onComplete: () -> Void

    private let steps = ["Analyzing your skill profile...", "Mapping personality traits...", "Matching career paths..."]

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            ZStack {
                Circle().stroke(AppColors.tealLight.opacity(0.3), lineWidth: 3).frame(width: 180, height: 180)
                    .rotationEffect(.degrees(rotation))
                Circle().trim(from: 0, to: 0.3).stroke(AppColors.tealAccent, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .frame(width: 180, height: 180).rotationEffect(.degrees(rotation))
                Circle().fill(.white).frame(width: 80, height: 80)
                    .overlay { Image(systemName: "book.fill").font(.system(size: 32)).foregroundStyle(AppColors.primaryPurple) }
            }

            VStack(spacing: 4) {
                Text("PathWise").font(.system(size: 24, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                Text("ETHEREAL MENTOR AI").capsStyle(size: 10)
            }

            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                    HStack(spacing: 12) {
                        if index < viewModel.processingStep {
                            Image(systemName: "checkmark.circle.fill").foregroundStyle(AppColors.successGreen)
                        } else if index == viewModel.processingStep {
                            Image(systemName: "circle.fill").foregroundStyle(AppColors.successGreen).font(.system(size: 10))
                        } else {
                            Image(systemName: "bubble.left").foregroundStyle(AppColors.grayText)
                        }
                        Text(step)
                            .font(index <= viewModel.processingStep ? .system(size: 14, weight: .bold) : .system(size: 14))
                            .foregroundStyle(index <= viewModel.processingStep ? AppColors.darkText : AppColors.grayText)
                    }
                }
            }

            VStack(spacing: 8) {
                ProgressBarView(progress: viewModel.processingProgress, gradient: LinearGradient(colors: [AppColors.tealAccent, AppColors.successGreenLight, AppColors.primaryPurple], startPoint: .leading, endPoint: .trailing))
                HStack {
                    Text("SYNTHESIZING DATA").capsStyle(size: 9, color: AppColors.grayText)
                    Spacer()
                    Text("\(Int(viewModel.processingProgress * 100))% COMPLETE").capsStyle(size: 9, color: AppColors.primaryPurple)
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            if viewModel.result != nil {
                Text("TAP ANYWHERE TO VIEW RESULTS").capsStyle(size: 10, color: AppColors.primaryPurple)
                    .onTapGesture { onComplete() }
            }

            Spacer()

            HStack(spacing: 32) {
                VStack(spacing: 4) { Image(systemName: "brain").foregroundStyle(AppColors.grayText); Text("COGNITIVE").capsStyle(size: 8) }
                VStack(spacing: 4) { Image(systemName: "shield").foregroundStyle(AppColors.grayText); Text("EXPERIENCE").capsStyle(size: 8) }
                VStack(spacing: 4) { Image(systemName: "sparkles").foregroundStyle(AppColors.grayText); Text("TRAJECTORY").capsStyle(size: 8) }
            }
            .padding(.bottom, 32)
        }
        .background(.white)
        .onAppear {
            withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) { rotation = 360 }
        }
        .onTapGesture { if viewModel.result != nil { onComplete() } }
    }
}
