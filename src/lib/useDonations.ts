"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  OrderByDirection,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase/client";
import type { Donation } from "./types";

interface UseDonationsOptions {
  /** Field to order by (default: "createdAt") */
  orderByField?: string;
  /** Sort direction (default: "desc") */
  direction?: OrderByDirection;
  /** Maximum number of documents to fetch (omit for unlimited) */
  maxResults?: number;
}

/**
 * Subscribes to the "donations" collection and returns live data.
 *
 * @returns `{ donations, loading }` — auto-updates when Firestore changes.
 */
export function useDonations(options: UseDonationsOptions = {}) {
  const {
    orderByField = "createdAt",
    direction = "desc",
    maxResults,
  } = options;

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints: QueryConstraint[] = [
      orderBy(orderByField, direction),
    ];

    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const donationsQuery = query(collection(db, "donations"), ...constraints);

    const unsubscribe = onSnapshot(donationsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Donation[];
      setDonations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderByField, direction, maxResults]);

  return { donations, loading };
}
