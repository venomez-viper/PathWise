import SwiftUI

struct ProgressBarView: View {
    let progress: Double
    var height: CGFloat = 6
    var trackColor: Color = AppColors.lightGrayBorder
    var gradient: LinearGradient = AppColors.progressGradient

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(trackColor).frame(height: height)
                Capsule().fill(gradient)
                    .frame(width: max(0, geo.size.width * progress), height: height)
                    .animation(.easeOut(duration: 0.8), value: progress)
            }
        }
        .frame(height: height)
    }
}
