

// https://cloud.google.com/error-reporting/docs/formatting-error-messages#formatting_requirements
const dns = require('dns');

export enum LogLevel {
  DEFAULT="DEFAULT",
  DEBUG="DEBUG",
  INFO="INFO",
  NOTICE="NOTICE",
  WARNING="WARNING",
  ERROR="ERROR",
  CRITICAL="CRITICAL",
  ALERT="ALERT",
  EMERGENCY="EMERGENCY"
} 

class VeloxLogger {
    
  isOnGoogleCloud: boolean
  serviceName:string

    constructor(serviceName:string) {
      this.isOnGoogleCloud = true  // we expect until we know
      dns.resolve('metadata.google.internal','A',(errors:any,records:any) => {
        
        if (errors!=null) {
            if (errors.code=='ENOTFOUND') {
              this.isOnGoogleCloud=false
              console.log("No google")
              return;
            }
        }
        this.isOnGoogleCloud=true;
        console.log("Is in Google")
      })

      this.serviceName= serviceName;
    }
  
    prepend(args: Array<any>): Array<any> {
      return this.serviceName ? [this.serviceName, ...args] : args
    }

    replaceNewLines(item: any): any {
      return item instanceof Error
        ? item.message + (item.stack || "").replace("\n", "\\n")
        : item
    }
  
    stringify(severity:string, ...args:any): string {
    return JSON.stringify({
      severity: severity,
      message: this.prepend(args).map(this.replaceNewLines).join(" "),
      serviceContext: {
        service: this.serviceName,
      },
      labels: {
        veloxProject: 'velox',
      },
      "@type": "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent"
    })
  }
    log(...args: any) {
      if (this.isOnGoogleCloud) {
        console.log(
          this.stringify('INFO',args)
        )
      } else {
        console.log(...this.prepend(args))
      }
    }
    info = this.log;
    error(...args: any) {
      if (this.isOnGoogleCloud) {
        const forceStackTrace = !args.some((a: any) => a instanceof Error)
        if (forceStackTrace) {
          args[0] = new Error(args[0].toString())
        }
        console.error(
          this.stringify('ERROR',args)
          /*
          JSON.stringify({
            severity: "ERROR",
            message: this.prepend(args).map(this.replaceNewLines).join(" "),
            serviceContext: {
              service: this.serviceName,
            },
            labels: {
              veloxProject: 'velox',
            }
          })
          */
        )
      } else {
        console.error(...this.prepend(args))
      }
    }
  }
  
  const LOG_NAME = process.env.LOG_NAME || 'velox-general';
  
  const veloxLogger = new VeloxLogger(LOG_NAME)

  export default veloxLogger;