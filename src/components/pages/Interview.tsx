import React, { useState } from "react";
import { mdiArrowRight, mdiArrowLeft, mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";

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
    <div className="h-full flex flex-col py-12 items-center">
      <div className="max-w-[700px]">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">
          Interview
        </h3>
        <Card>
          <CardHeader>
            <p>Page {currentPage + 1} of 3</p>
          </CardHeader>
          {renderPage()}
          <CardFooter>
            <div className="flex w-full justify-between items-center">
              <Button
                disabled={currentPage < 1}
                variant="secondary"
                onClick={handlePreviousPage}
              >
                <Icon className='h4 w-4 mr-2' path={mdiArrowLeft} />
                Previous
              </Button>

              {currentPage < 2 && (
                <Button
                  className="ml-auto"
                  variant="default"
                  onClick={handleNextPage}
                >
                  Next
                  <Icon className='h4 w-4 ml-2' path={mdiArrowRight} />
                </Button>
              )}

              {currentPage === 2 &&
                <Button
                  className="ml-auto"
                  variant="default"
                  onClick={handleNextPage}
                >
                  Start
                  <Icon className='h4 w-4 ml-2' path={mdiCheck} />
                </Button>
              }
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const JobDescriptionCard: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <p className="text-base text-muted-foreground">
          Please enter the job description you would like to simulate an interview for.
        </p>
      </CardHeader>
      <CardContent>
        <Textarea placeholder="Paste here..." />
        <p className="text-sm text-muted-foreground">
          This will be used to generate relevant questions for your interview.
        </p>
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
