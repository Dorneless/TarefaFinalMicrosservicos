"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventsService, userService } from "@/lib/api";
import { Event, User } from "@/types";

export function GlobalPrefetcher() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const prefetchData = async () => {
            // Prefetch User Profile
            await queryClient.prefetchQuery({
                queryKey: ["user"],
                queryFn: async () => {
                    const { data } = await userService.get<User>("/users/me");
                    return data;
                },
                staleTime: 1000 * 60 * 5, // 5 minutes
            });

            // Prefetch Events List
            await queryClient.prefetchQuery({
                queryKey: ["events"],
                queryFn: async () => {
                    const { data } = await eventsService.get<Event[]>("/events");
                    return data;
                },
                staleTime: 1000 * 60 * 5, // 5 minutes
            });

            // Add more prefetches here as needed (e.g., certificates, notifications)
            console.log("Global prefetching initiated");
        };

        // Execute prefetching after a short delay to prioritize initial render
        const timer = setTimeout(() => {
            prefetchData();
        }, 1000);

        return () => clearTimeout(timer);
    }, [queryClient]);

    return null;
}
