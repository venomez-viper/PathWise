import SwiftUI

struct LoadingView: View {
    var message: String = "Loading..."

    var body: some View {
        VStack(spacing: 16) {
            ProgressView().controlSize(.large).tint(AppColors.primaryPurple)
            Text(message).font(AppTypography.callout).foregroundStyle(AppColors.grayText)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.offWhiteBg)
    }
}
