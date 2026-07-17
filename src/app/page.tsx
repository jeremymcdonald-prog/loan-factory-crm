import { redirect } from "next/navigation";

/** The default landing screen is Today, never a "Home" (Decisions D-02). */
export default function RootPage() {
  redirect("/today");
}
