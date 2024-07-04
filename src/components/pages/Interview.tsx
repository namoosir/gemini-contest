import React from "react";
import { useState } from "react";

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
    <div>
      <h1>Interview Page</h1>
      <p>Welcome to the interview page!</p>
      <Card>
        <CardFooter>
          <p>Page {currentPage + 1} of 3</p>
        </CardFooter>
        {renderPage()}
        <CardFooter>
          {currentPage > 0 && (
            <Button variant="ghost" onClick={() => handlePreviousPage()}>
              <span>Back</span>
            </Button>
          )}
          {currentPage < 2 && (
            <Button variant="ghost" onClick={() => handleNextPage()}>
              <span>Next</span>
            </Button>
          )}
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
      </CardHeader>
      <p>Paste your the job description you are trying to interview for.</p>
      <CardContent><Textarea placeholder="Type your message here." /></CardContent>
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
