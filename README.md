# Velox Common  

The common library for Velox Project


# VeloxTypes
```
import { Strategy } from "velox-common/dist/veloxModels"

```

# VeloxLogging


Give service name in environment `LOG_NAME`

We have log.info and log.error messages for Velox-logging
```
import veloxLogger, { LogLevel } from "velox-common/dist/veloxlogger"
OR
import {veloxLogger} from "velox-common"

index.error("message...",ErrorExcepction)

index.error("Just stuf")

index.info()
index.debug()

index.emergency() // panic - process will be shutdown

```