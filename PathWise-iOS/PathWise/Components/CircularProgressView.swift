import SwiftUI

struct CircularProgressView: View {
    let progress: Double
    var size: CGFloat = 100
    var lineWidth: CGFloat = 10
    var trackColor: Color = AppColors.lightGrayBorder
    var progressColor: Color = AppColors.tealAccent
    var showPercentage: Bool = true

    var body: some View {
        ZStack {
            Circle()
                .stroke(trackColor, lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(progressColor, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 1.0), value: progress)
            if showPercentage {
                VStack(spacing: 2) {
                    Text("\(Int(progress * 100))%")
                        .font(size > 80 ? AppTypography.title2 : AppTypography.headline)
                        .fontWeight(.bold)
                        .foregroundStyle(AppColors.darkText)
                    if size > 100 {
                        Text("READY")
                            .capsStyle()
                    }
                }
            }
        }
        .frame(width: size, height: size)
    }
}
