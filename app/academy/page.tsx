import React from "react";
import { getAcademyData } from "@/app/actions/academy-actions";
import { AcademyInteractiveEngine } from "@/components/academy/AcademyInteractiveEngine";
import { TOPIC_CATEGORIES } from "@/lib/data/academy-curriculum";

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
    // Phase 2: Ultimate Zero-Mock Fetcher
    // We attempt to fetch courses from the Postgres database.
    let dbCourses: any[] = [];
    try {
        dbCourses = await getAcademyData();
    } catch (e) {
        console.error("LMS DB Connection Missing", e);
    }
    
    // Check if the database has been properly seeded
    const isDatabaseSeeded = dbCourses.length > 0;

    return (
        <div className="bg-[#FDFCF8]">
            <AcademyInteractiveEngine 
                dbCourses={dbCourses} 
                isSeeded={isDatabaseSeeded}
                expectedCategories={TOPIC_CATEGORIES.length} 
            />
        </div>
    );
}
