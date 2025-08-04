'use client';

import React from 'react';
import CodeShowcase from './CodeShowcase';
import ServicesSection from './ServicesSection';
import ProcessSection from './ProcessSection';
import TestimonialSection from './TestimonialSection';

// Memoized versions of heavy components to prevent unnecessary re-renders
export const MemoizedCodeShowcase = React.memo(CodeShowcase);
export const MemoizedServicesSection = React.memo(ServicesSection);
export const MemoizedProcessSection = React.memo(ProcessSection);
export const MemoizedTestimonialSection = React.memo(TestimonialSection);