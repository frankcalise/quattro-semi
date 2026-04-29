import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const modes = [
  {
    title: "Practice",
    body: "Learn swaps, chains, and manual raise without automatic pressure.",
    href: "/practice"
  },
  {
    title: "Classic",
    body: "Endless score attack with rising pressure and deterministic rules.",
    href: "/classic"
  },
  {
    title: "Board Lab",
    body: "Inspect the first Skia board, selector, seed, and debug summary.",
    href: "/debug/board-lab"
  }
] as const;

export default function HomeScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: "#201713" }}
      contentContainerStyle={{ padding: 20, gap: 18 }}
    >
      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: "#F6E8D2", fontSize: 28, fontWeight: "800" }}>
          Quattro Semi
        </Text>
        <Text selectable style={{ color: "#D8C2A8", fontSize: 16, lineHeight: 23 }}>
          A portrait-first rising-stack puzzle game on a warm tabletop.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {modes.map((mode) => (
          <Link key={mode.href} href={mode.href} asChild>
            <Pressable
              testID={`home-link-${mode.title.toLowerCase().replaceAll(" ", "-")}`}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#3A2A20" : "#2C211A",
                borderColor: "#5E4636",
                borderCurve: "continuous",
                borderRadius: 8,
                borderWidth: 1,
                gap: 6,
                padding: 16
              })}
            >
              <Text selectable style={{ color: "#FFF5E7", fontSize: 18, fontWeight: "700" }}>
                {mode.title}
              </Text>
              <Text selectable style={{ color: "#CDB49A", fontSize: 14, lineHeight: 20 }}>
                {mode.body}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
