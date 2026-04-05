import SwiftUI

struct CardView<Content: View>: View {
    var padding: CGFloat = AppTheme.cardPadding
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) { content }
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
            .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }
}
