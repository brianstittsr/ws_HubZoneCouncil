"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UpdateMemberPage() {
  const [email, setEmail] = useState("nhallums@strategicvalueplus.com");
  const [sourceEmail, setSourceEmail] = useState("bstitt@strategicvalueplus.com");
  const [role, setRole] = useState("admin");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Copy permissions from another user
  const handleCopyPermissions = async () => {
    if (!db) {
      setStatus("Error: Database not initialized");
      return;
    }

    setIsLoading(true);
    setStatus(`Copying permissions from ${sourceEmail} to ${email}...`);

    try {
      const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);

      // Find source team member
      const sourceQuery = query(
        teamMembersRef,
        where("emailPrimary", "==", sourceEmail.toLowerCase().trim())
      );
      const sourceSnapshot = await getDocs(sourceQuery);

      if (sourceSnapshot.empty) {
        setStatus(`Error: Source user ${sourceEmail} not found`);
        setIsLoading(false);
        return;
      }

      const sourceData = sourceSnapshot.docs[0].data();
      const sourceRole = sourceData.role || "member";

      // Find target team member
      const targetQuery = query(
        teamMembersRef,
        where("emailPrimary", "==", email.toLowerCase().trim())
      );
      const targetSnapshot = await getDocs(targetQuery);

      if (targetSnapshot.empty) {
        setStatus(`Error: Target user ${email} not found`);
        setIsLoading(false);
        return;
      }

      const targetDoc = targetSnapshot.docs[0];
      const targetData = targetDoc.data();
      const targetName = `${targetData.firstName || ""} ${targetData.lastName || ""}`.trim();

      // Update target with source's role
      const targetRef = doc(db, COLLECTIONS.TEAM_MEMBERS, targetDoc.id);
      await updateDoc(targetRef, {
        role: sourceRole,
        updatedAt: Timestamp.now(),
      });

      setStatus(`✅ Success! ${targetName} now has role: ${sourceRole} (copied from ${sourceEmail})`);
    } catch (error: any) {
      console.error("Error copying permissions:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!db) {
      setStatus("Error: Database not initialized");
      return;
    }

    setIsLoading(true);
    setStatus("Searching for team member...");

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);

      // Find team member by email
      const primaryQuery = query(
        teamMembersRef,
        where("emailPrimary", "==", normalizedEmail)
      );
      const primarySnapshot = await getDocs(primaryQuery);

      let teamMemberDoc = null;
      let teamMemberId = null;

      if (!primarySnapshot.empty) {
        teamMemberDoc = primarySnapshot.docs[0];
        teamMemberId = teamMemberDoc.id;
      } else {
        // Check secondary email
        const secondaryQuery = query(
          teamMembersRef,
          where("emailSecondary", "==", normalizedEmail)
        );
        const secondarySnapshot = await getDocs(secondaryQuery);

        if (!secondarySnapshot.empty) {
          teamMemberDoc = secondarySnapshot.docs[0];
          teamMemberId = teamMemberDoc.id;
        }
      }

      if (!teamMemberId || !teamMemberDoc) {
        setStatus(`Error: No team member found with email: ${email}`);
        setIsLoading(false);
        return;
      }

      const teamMemberData = teamMemberDoc.data();
      const memberName = `${teamMemberData.firstName || ""} ${teamMemberData.lastName || ""}`.trim();

      setStatus(`Found: ${memberName}. Updating role to ${role}...`);

      // Update the team member
      const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberId);
      await updateDoc(teamMemberRef, {
        role: role,
        updatedAt: Timestamp.now(),
      });

      setStatus(`✅ Success! Updated ${memberName} to role: ${role}`);
    } catch (error: any) {
      console.error("Error updating member:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Update Team Member</CardTitle>
          <CardDescription>
            Update a team member's role by email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? "Updating..." : "Update Member"}
          </Button>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-2">Copy Permissions From Another User</h3>
            <div className="space-y-2 mb-3">
              <Label htmlFor="sourceEmail">Source Email (copy from)</Label>
              <Input
                id="sourceEmail"
                type="email"
                value={sourceEmail}
                onChange={(e) => setSourceEmail(e.target.value)}
                placeholder="source@example.com"
              />
            </div>
            <Button 
              onClick={handleCopyPermissions} 
              disabled={isLoading || !email || !sourceEmail}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? "Copying..." : "Copy Permissions"}
            </Button>
          </div>

          {status && (
            <div className={`p-3 rounded-md text-sm ${
              status.startsWith("✅") 
                ? "bg-green-100 text-green-800" 
                : status.startsWith("Error") 
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}>
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
