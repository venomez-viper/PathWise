import SwiftUI

struct CardView<Content: View>: View {
    var padding: CGFloat
    let content: () -> Content

    init(padding: CGFloat = AppTheme.cardPadding, @ViewBuilder content: @escaping () -> Content) {
        self.padding = padding
        self.content = content
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) { content() }
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
            .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }
}
