import WidgetKit
import SwiftUI
internal import ExpoWidgets

struct CycleWidget: Widget {
  let name: String = "CycleWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      WidgetsEntryView(entry: entry)
    }
    .configurationDisplayName("Cycle Tracker")
    .description("Shows your current cycle phase and days until next period")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}