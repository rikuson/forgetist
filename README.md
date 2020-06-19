# Forgetist

Life hacking tool using todoist.

## Let's forget the past

I don't like seeing incomplete tasks which should have done few months ago.  
Forgetist simply deletes overdue tasks from [Todoist](https://todoist.com).  
It only affects to overdue tasks.

If you just leave it, those tasks are not important in your life.  
Then let's forget it and start brand new day!

## Installation

```
$ npm install -g forgetist
```

Add api token in your `.bash_profile`.  
You can check your api token [here](https://todoist.com/prefs/integrations).

```
export TODOIST_API_TOKEN=XXXXXXXXXXXXXXXX
```

## Usage

```
$ forgetist --help
forgetist [command]

Commands:
  forgetist forget [id...]    Delete overdue task
  forgetist list              List overdue tasks
  forgetist remember [id...]  Reschedule overdue tasks

Options:
  --help             Show help
  --version          Show version number
  --all, -a          All of the overdue task
  --from             From the datetime
  --to               To the datetime
  --until, -u        Due date
```

List overdue tasks.

```
$ forgetist list
┌─────┬──────┬───────┬────────────┬───────┐
│ (index)  │     ID     │   CONTENT    │        CREATED         │   DUE DATE   │
├─────┼──────┼───────┼────────────┼───────┤
│    0     │ 1234567890 │'first task'  │'2020-06-11T11:19:55Z'  │ '2020-06-11' │
│    1     │ 2345678901 │'second task' │'2020-06-11T16:49:47Z'  │ '2020-06-09' │
└─────┴──────┴───────┴────────────┴───────┘
```

List all overdue tasks including deleted task.

```
$ forgetist list --all
$ forgetist list --from="2020-06-10"
```

Delete overdue tasks.

```
$ forgetist forget --all
```

You can specify task id.

```
$ forgetist forget 1234
```

Don't worry, there's log option.

```
$ forgetist forget 1234 --log
```

Reschedule a task.

```
$ forgetist remember 1234 --to="2020-06-13"
```

## Want pressure?

Set up cron job.

```
$ crontab -e
1 0 * * * forgetist forget --all
```
