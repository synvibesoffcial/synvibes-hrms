export {}

// Create a type for the roles
export type Roles = 'admin' | 'hr' | 'employee' ;

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}