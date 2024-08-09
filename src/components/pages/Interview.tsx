import React, { useEffect, useState } from "react";
import { Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
import { usePrevious } from "@uidotdev/usehooks";

import {
  getUserResumes,
  getResumeObject,
  Resume,
  uploadResume,
} from "@/services/firebase/resumeService";
import useAuthContext from "@/hooks/useAuthContext";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import { Card, CardHeader } from "@/components/ui/card";
import Steps from "../Steps";
import JobDescriptionCard from "../JobDescriptionCard";
import ResumeCard from "../ResumeCard";
import InterviewSettingsCard from "../InterviewSettingsCard";
import CardHOC from "../cardContentHOC";
import { useNavigate } from "react-router-dom";
import { InterviewProps } from "./types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export type Page = 0 | 1 | 2;

const Interview: React.FC = () => {
  const { storage, db } = useFirebaseContext();
  const { user } = useAuthContext();

  const [currentPage, setCurrentPage] = useState<Page>(0);
  const previousPage = usePrevious(currentPage);
  const [jobDescription, setJobDescription] = useState<string | undefined>();

  const [files, setFiles] = useState<File[] | null>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeURL, setResumeURL] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<
    "existing" | "new" | null
  >(null);

  const [interviewDuration, setInterviewDuration] = useState<string>("5");
  const [interviewType, setInterviewType] = useState<string>("technical");
  const [interviewMode, setInterviewMode] = useState<string>("normal");

  const [resumeError, setResumeError] = useState<string | undefined>(undefined);
  const [jobDescriptionError, setJobDescriptionError] = useState<
    string | undefined
  >(undefined);

  const navigate = useNavigate();

  useEffect(() => {
    const getResume = async () => {
      if (!user) return;

      const resumes = await getUserResumes(db, user?.uid);

      if (!resumes || resumes.length === 0) return;

      return setResume(resumes[0]);
    };

    // TODO: find better way to do this
    void getResume();
  }, [db, user]);

  useEffect(() => {
    const fetchPDF = async () => {
      if (!resume) return;

      const url = await getResumeObject(storage, resume.url);

      setResumeURL(url);
    };

    void fetchPDF();
  }, [resume, storage]);

  useEffect(() => {
    if (files?.length === 0 && resumeURL) {
      setSelectedResume("existing");
    }
  }, [files, resumeURL]);

  useEffect(() => {
    if (resumeURL) {
      setSelectedResume("existing");
    }
  }, [resumeURL]);

  const uploadResumeToStorage = async () => {
    if (files?.length === 1 && user)
      await uploadResume(storage, files[0], user.uid);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage + 1) as Page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage - 1) as Page);
  };

  const handleFinish = async () => {
    await uploadResumeToStorage();

    const params: InterviewProps = {
      jobDescription: jobDescription,
      interviewDuration: interviewDuration,
      interviewType: interviewType,
      interviewMode: interviewMode,
    };
    navigate("/chat", { state: params });
  };

  function interviewNextPageHandler() {
    if (jobDescription === undefined || jobDescription === "") {
      setJobDescriptionError("Please enter a job description");
    } else handleNextPage();
  }

  const resumeNextPageHandler = () => {
    console.log(selectedResume);
    if (selectedResume != undefined) {
      handleNextPage();
    } else {
      setResumeError("Please select a resume");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return (
          <CardHOC
            handlePreviousPage={handlePreviousPage}
            handleNextPage={interviewNextPageHandler}
            currentPage={currentPage}
          >
            <JobDescriptionCard
              text={jobDescription}
              setText={setJobDescription}
              error={jobDescriptionError}
              setError={setJobDescriptionError}
            />
          </CardHOC>
        );
      case 1:
        return (
          <CardHOC
            handlePreviousPage={handlePreviousPage}
            handleNextPage={resumeNextPageHandler}
            currentPage={currentPage}
          >
            <ResumeCard
              resumeURL={resumeURL}
              files={files}
              setFiles={setFiles}
              selectedResume={selectedResume}
              setSelectedResume={setSelectedResume}
              error={resumeError}
              setError={setResumeError}
            />
          </CardHOC>
        );
      case 2:
        return (
          <CardHOC
            handlePreviousPage={handlePreviousPage}
            handleFinish={handleFinish}
            currentPage={currentPage}
          >
            <InterviewSettingsCard
              duration={interviewDuration}
              setDuration={setInterviewDuration}
              type={interviewType}
              setType={setInterviewType}
              mode={interviewMode}
              setMode={setInterviewMode}
            />
          </CardHOC>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col py-12 items-center">
      <div className="w-[1120px] ">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">
          Interview
        </h3>
        <Card className="flex flex-col">
          <CardHeader>
            <Steps onStepClick={setCurrentPage} currentStep={currentPage} />
          </CardHeader>
          <AnimatePresence initial={false}>
            <div className="flex-1 overflow-hidden">
              <motion.div
                key={currentPage}
                initial={{
                  opacity: 0,
                  height: "auto",
                  x: (currentPage > previousPage ? 1 : -1) * 500,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: (currentPage > previousPage ? -1 : 1) * 500,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                className="w-full h-full flex flex-col justify-center items-center"
              >
                {renderPage()}
              </motion.div>
            </div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default Interview;
