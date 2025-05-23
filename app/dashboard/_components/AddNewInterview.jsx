"use client";

import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModal';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';

import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');

  const [loading,setLoading]=useState(false);

  const [jsonResponse,setJsonResponse]= useState([]);

  const router=useRouter();

  const {user}=useUser();



  const onSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    console.log(jobDesc, jobExperience, jobPosition);
   


    const InputPrompt = "job position:"+jobPosition+", Job Description: "+jobDesc+",Years of Experience: "+jobExperience+", Depends on job Position ,Job Description & Years of Experience give us "+process.env.NEXT_PUBLIC_INTERVIEW_QUESTIONS_COUNT+" interview questions  along with answers in the Json Formate not requires the explanation of Questions"


    
        const result=await chatSession.sendMessage(InputPrompt);

        const MockJsonResp=(result.response.text()).replace('```json','').replace('```','');

        console.log(JSON.parse(MockJsonResp));

        setJsonResponse(MockJsonResp);

        if(MockJsonResp){

           const resp=await db.insert(MockInterview).values({
            mockId:uuidv4(),
            jsonMockResp:MockJsonResp,
            jobPosition:jobPosition,
            jobDesc:jobDesc,
            jobExperience:jobExperience,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD-MM-YYYY')
           }).returning({
            mockId:MockInterview.mockId
           });

           console.log("Inserted ID:",resp);
            if(resp){
              setOpenDialog(false);

              router.push('/dashboard/interview/'+resp[0]?.mockId)
            }
          }
          else{
            console.log("ERROR")

          }

         setLoading(false);
   


    
  };

  return (
    <div>
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
        onClick={() => setOpenDialog(true)}
      >
        <h2 className='font-bold text-lg text-center'>+ Add New</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about Your job interviewing</DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add Details about job position, your skills, and years of experience</h2>

                  <div className='mt-7 my-3'>
                    <label>Job Role/Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      value={jobPosition}
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>

                  <div className='my-3'>
                    <label>Job Description? Tech Stack (In Short)</label>
                    <Textarea
                      placeholder="Ex. React, Angular, Node.Js, MySql etc"
                      required
                      value={jobDesc}
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>

                  <div className='my-3'>
                    <label>Years of experience</label>
                    <Input
                      placeholder="Ex. 0-5"
                      type='number'
                      max="50"
                      required
                      value={jobExperience}
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>
                </div>

                <div className='flex gap-5 justify-end'>
                  <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading} >
                    {loading?
                    <>
                    <LoaderCircle className='animate-spin'/>  'Generating from AI'
                    </>: 'Start Interview'
                  }
                    
                 </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
