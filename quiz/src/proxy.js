import { NextResponse, NextRequest } from "next/server";

export function proxy(request) {
  const path = request.nextUrl.pathname;

  // 1. Define Public Paths
  const isStudentPublicPath = path === '/login' || path === '/signup' || path === '/verify-email'|| path === '/forgot-password' || path === '/reset-password';
  const isLecturerPublicPath = path === '/lecturer/login' || path === '/lecturer/signup' || path === '/lecturer/verify-email' || path === '/forgot-password' || path === '/reset-password';

  // 2. Define Protected Paths
  // Anything starting with '/student' is protected (except we don't need to worry because public ones don't start with /student)
  const isStudentProtectedPath = path.startsWith('/student');
  const isLecturerProtectedPath = path.startsWith('/lecturer') && !isLecturerPublicPath;

  // 3. Get Tokens
  const student_token = request.cookies.get('student_token')?.value || '';
  const lecturer_token = request.cookies.get('lecturer_token')?.value || '';

  // 4. Redirect logged-in users away from public pages
  if (isStudentPublicPath && student_token) {
    return NextResponse.redirect(new URL('/student', request.nextUrl));
  }

  if (isLecturerPublicPath && lecturer_token) {
    return NextResponse.redirect(new URL('/lecturer/dashboard', request.nextUrl));
  }

  // 5. Protect Student Routes
  if (isStudentProtectedPath && !student_token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 6. Protect Lecturer Routes
  if (isLecturerProtectedPath && !lecturer_token) {
    return NextResponse.redirect(new URL('/lecturer/login', request.nextUrl));
  }

  // 7. (Optional but highly recommended) Prevent cross-access
  // If a student tries to visit /lecturer/...
  if (isLecturerProtectedPath && student_token && !lecturer_token) {
    return NextResponse.redirect(new URL('/student', request.nextUrl));
  }
  
  // If a lecturer tries to visit /student/...
  if (isStudentProtectedPath && lecturer_token && !student_token) {
    return NextResponse.redirect(new URL('/lecturer/dashboard', request.nextUrl));
  }
}

export const config = {
  matcher: [
    '/student/:path*',
    '/lecturer/:path*',
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password', 
    '/reset-password',  
    '/lecturer/login',
    '/lecturer/signup',
    '/lecturer/verify-email'
  ]
}