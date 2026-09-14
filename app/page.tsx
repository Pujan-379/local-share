import ComposeBox from "@/components/ComposeBox";
import Feed from "@/components/Feed";
import SharedNote from "@/components/SharedNote";
export default function Home() {
  return (
    <>
      <SharedNote />
      <ComposeBox />
      <Feed />
    </>
  );
}
