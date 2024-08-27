import { Request, Response, NextFunction } from "express";

declare global {
  type Req = Request;
  type Res = Response;
  type NextFn = NextFunction;
}
