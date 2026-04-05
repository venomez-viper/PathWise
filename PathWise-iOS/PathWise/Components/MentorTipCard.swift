import SwiftUI

struct MentorTipCard: View {
    let title: String
    let message: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "sparkles")
                .foregroundStyle(AppColors.successGreen)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.darkText)
                Text(message).font(.system(size: 12)).foregroundStyle(AppColors.darkText.opacity(0.8))
            }
        }
        .padding(16)
        .background(AppColors.mentorTipBg, in: RoundedRectangle(cornerRadius: 12))
    }
}
