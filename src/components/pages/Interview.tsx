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
import ComboBox from "../ComboBox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Steps from "../Steps";

type Page = 0 | 1 | 2;

const Interview: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(0);

  const handleNextPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage + 1) as Page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage - 1) as Page);
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
      <div className="max-w-[700px] min-w-[700px]">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">
          Interview
        </h3>
        <Card>
          <CardHeader>
            <Steps currentStep={currentPage} />
          </CardHeader>
          {renderPage()}
          <CardFooter>
            <div className="flex w-full justify-between items-center">
              <Button
                disabled={currentPage < 1}
                variant="secondary"
                onClick={handlePreviousPage}
              >
                <Icon className="h4 w-4 mr-2" path={mdiArrowLeft} />
                Previous
              </Button>

              {currentPage < 2 && (
                <Button
                  className="ml-auto"
                  variant="default"
                  onClick={handleNextPage}
                >
                  Next
                  <Icon className="h4 w-4 ml-2" path={mdiArrowRight} />
                </Button>
              )}

              {currentPage === 2 && (
                <Button
                  className="ml-auto"
                  variant="default"
                  onClick={handleNextPage}
                >
                  Start
                  <Icon className="h4 w-4 ml-2" path={mdiCheck} />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const JobDescriptionCard: React.FC = () => {
  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <p className="text-base text-muted-foreground">
          Please enter the job description you would like to simulate an
          interview for.
        </p>
      </CardHeader>
      <CardContent>
        <Textarea placeholder="Paste here..." />
      </CardContent>
    </div>
  );
};

const ResumeCard: React.FC = () => {
  const tempItems = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ];

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <p className="text-base text-muted-foreground">
          Please select or upload a relevant resume.
        </p>
      </CardHeader>
      <CardContent>
        <ComboBox items={tempItems} name={"Resume"} />
        <div className="grid w-full max-w-[50%] items-center gap-1.5 ">
          <Label htmlFor="resume">Upload Resume</Label>
          <Input
            id="resume"
            type="file"
            className="file:text-muted-foreground"
          />
        </div>
      </CardContent>
    </div>
  );
};

const InterviewCard: React.FC = () => {
  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Interview</CardTitle>
      </CardHeader>
      <CardContent>{/* Add your interview content here */}</CardContent>
    </div>
  );
};

export default Interview;
