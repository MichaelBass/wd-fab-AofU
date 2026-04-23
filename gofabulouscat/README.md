# The NIH/BU WD-FAB as a microservice

To start the server initiate Redis at `localhost:6379` then run `go run main.go server`. These commands start the microservice at `localhost:3000`. Both the Redis location and the server port are configurable, but the ability to modify them has not yet been exposed as of 2024 Dec 20.

After starting the server, to view the API documentation go to http://localhost:3000/docs

# Example workflow

To create a new CAT session one needs to pass in respondent and session settings. See the following example:

```
curl -H 'Content-Type: application/json' \
    -d '{"car": true, "physical":true, "mental":true, "respondent_id": "some string here", "sex": 0, "wheelchair":true}' \
    -X POST localhost:3000
```

As output you'll get the session information

```
{"session_id":"wdfab:2f1c48c0-c249-41a2-bba3-7c6a39fb9393","start_time":"2024-12-20T16:46:06.015495-05:00","expiration_time":"2024-12-21T16:46:06.015495-05:00"}

```

where by default each session expires after 24 hours. Let's save this session id as an environment variable:

```
export sid="wdfab:2f1c48c0-c249-41a2-bba3-7c6a39fb9393"
```

You can get the list of sessions from the GET method by calling `http://localhost:3000/sessions?active_only=true`  (or false if you want to get IDs for expired sessions as well that haven't been purged from Redis). This query yields the JSON data payload:

```
{
  "sessions": [
    {
      "session_id": "wdfab:2f1c48c0-c249-41a2-bba3-7c6a39fb9393",
      "start_time": "0001-01-01T00:00:00Z",
      "expiration_time": "2024-12-21T16:46:06.015495-05:00"
    },
    {
      "session_id": "wdfab:71d16db1-7852-40df-b5fe-dbc4aefa3542",
      "start_time": "0001-01-01T00:00:00Z",
      "expiration_time": "2024-12-21T15:50:41.04796-05:00"
    }
  ]
}
```

As of 2025/01/03, the backend has no automatic scale selection. 
The frontend is responsible for selecting a scale to present to the respondent.
The GET endpoint for retrieving the next item in a given scale is http://localhost:3000/{session_id}/{scale}/item 

An example output from this endpoint is as follows:

```
{
  "item_name": "CC099",
  "question": "Are you able to think things through before making a decision?",
  "responses": {
    "1": {
      "text": "Yes, without difficulty",
      "value": 5
    },
    "2": {
      "text": "Yes, with a little difficulty",
      "value": 4
    },
    "3": {
      "text": "Yes, with some difficulty",
      "value": 3
    },
    "4": {
      "text": "Yes, with a lot of difficulty",
      "value": 2
    },
    "5": {
      "text": "Unable to do",
      "value": 1
    },
    "6": {
      "text": "I don't know",
      "value": 8
    }
  },
  "version": 3.15,
  "scale": "CC",
  "domain": "bh"
}
```

To record the response to this item, one needs to post to the http://localhost:3000/{session_id}/response endpoint with the following information:

```
{
  "domain": "bh",
  "scale": "CC",
  "value": 4 // for example
  "item_name": "CC099"
}
```

for example:

```
curl -X 'POST' \
  'http://localhost:3000/wdfab%3Aa27d7ec6-19ae-47ca-b743-a7b952cd7653/response' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "domain": "bh",
  "item_name": "CC099",
  "scale": "CC",
  "value": 4
}'
```

will record a value of 4 for this item.

At any point one may GET http://localhost:3000/{session_id} check the status of the section (to get scale scores) here is an example 

```
{
  "session": {
    "session_id": "wdfab:a27d7ec6-19ae-47ca-b743-a7b952cd7653",
    "start_time": "0001-01-01T00:00:00Z",
    "expiration_time": "2025-01-04T17:58:16.02507-05:00",
    "responses": {
      "CC099": 4
    },
    "physical": false,
    "mental": true,
    "car": true,
    "wheelchair": false
  },
  "scores": {
    "bh": {
      "CC": {
        "mean": -0.812325187583158,
        "std": 0.460755687882498,
        "deciles": [-1.41144695278492, -1.2070040968496, -1.06542932086652, -0.947083076866687, -0.837342147661204, -0.727765405598971, -0.609138513348474, -0.467922855456937, -0.263409416269002]
      },
      "ME": {
        "mean": 1.03042574473022e-15,
        "std": 5.39561869585912,
        "deciles": [-7.53131356368937, -5.4183731792652, -3.52372352617556, -1.74783639365988, -0.0250626566416027, 1.69771108037667, 3.47359821289235, 5.36824786598199, 7.48118825040616]
      },
      "RS": {
        "mean": 1.03042574473022e-15,
        "std": 5.39561869585912,
        "deciles": [-7.53131356368937, -5.4183731792652, -3.52372352617556, -1.74783639365988, -0.0250626566416027, 1.69771108037667, 3.47359821289235, 5.36824786598199, 7.48118825040616]
      },
      "SR": {
        "mean": 1.03042574473022e-15,
        "std": 5.39561869585912,
        "deciles": [-7.53131356368937, -5.4183731792652, -3.52372352617556, -1.74783639365988, -0.0250626566416027, 1.69771108037667, 3.47359821289235, 5.36824786598199, 7.48118825040616]
      },
      "UNSCORED_BH": {
        "mean": 1.03042574473022e-15,
        "std": 5.39561869585912,
        "deciles": [-7.53131356368937, -5.4183731792652, -3.52372352617556, -1.74783639365988, -0.0250626566416027, 1.69771108037667, 3.47359821289235, 5.36824786598199, 7.48118825040616]
      }
    }
  }
}
```
