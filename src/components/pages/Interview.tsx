import React, { useState } from "react";
import { mdiArrowRight, mdiArrowLeft } from "@mdi/js";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const Interview: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return <JobDescriptionCard />;
      case 1:
        return <ResumeCard />;
      case 2:
        return <InterviewCard />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col py-4">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">Interview</h3>
      <p>Welcome to the interview page!</p>
      <Card>
        <CardHeader>
          <p>Page {currentPage + 1} of 3</p>
        </CardHeader>
        {renderPage()}
        <CardFooter>
          <div className="flex w-full justify-between items-center">
            {currentPage > 0 && (
              <Button
                variant="secondary"
                onClick={handlePreviousPage}
              >
                Previous
              </Button>
            )}
            {currentPage < 2 && (
              <Button
                className="ml-auto"
                variant="default"
                onClick={handleNextPage}
              >
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const JobDescriptionCard: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <p>Paste your the job description you are trying to interview for.</p>
      </CardHeader>
      <CardContent>
        <Textarea placeholder="Type your message here." />
      </CardContent>
    </>
  );
};

const ResumeCard: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
      </CardHeader>
      <CardContent>{/* Add your resume content here */}</CardContent>
    </>
  );
};

const InterviewCard: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Interview</CardTitle>
      </CardHeader>
      <CardContent>{/* Add your interview content here */}</CardContent>
    </>
  );
};

export default Interview;
