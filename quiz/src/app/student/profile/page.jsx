"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, Stat } from "@/components/ui";
import Navbar from "@/components/navbar";


export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        if (res.data.success) setUser(res.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await axios.get("/api/auth/logout");
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!user) return <div className="min-h-screen grid place-items-center">User not found.</div>;

  return (
    <main className="min-h-screen gradient-mesh">
      <Navbar role="student" onLogout={handleLogout} />
      
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <Card className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="mt-1 inline-block text-xs bg-success/15 text-success px-2 py-1 rounded-full font-medium">
                {user.isVerified ? "✓ Verified" : "Not Verified"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Role" value="Student" />
            <Stat label="Member Since" value={new Date(user.dateCreated).toLocaleDateString()} />
            <Stat label="Phone" value={user.phone_number || "N/A"} />
            <Stat label="Address" value={`${user.location?.street || ""}, ${user.location?.building || ""}`} />
          </div>
        </Card>
      </section>
    </main>
  );
}