"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Inbox } from "lucide-react";
import { ReferralStatusBadge } from "./ReferralStatusBadge";
import type { ZenthiumReferralStatus } from "@/types/zenthium";

export interface ReferralRow {
  id: string;
  title: string;
  propertyName: string;
  address: { city: string; state: string };
  status: ZenthiumReferralStatus;
  createdAt: string;
  updatedAt: string;
}

interface ReferralTableProps {
  referrals: ReferralRow[];
  isLoading?: boolean;
}

export function ReferralTable({ referrals, isLoading }: ReferralTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <div className="animate-pulse text-sm">Loading referrals...</div>
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Inbox className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-muted-foreground">No referrals found</p>
        <p className="text-sm text-muted-foreground">Submit your first data center site referral to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-20"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.map((ref) => (
          <TableRow key={ref.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell className="font-medium">
              <Link
                href={`/portal/admin/zenthium-referrals/${ref.id}`}
                className="hover:text-primary transition-colors"
              >
                {ref.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">{ref.propertyName}</TableCell>
            <TableCell className="text-sm">
              {ref.address.city}, {ref.address.state}
            </TableCell>
            <TableCell>
              <ReferralStatusBadge status={ref.status} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(ref.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(ref.updatedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/portal/admin/zenthium-referrals/${ref.id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
