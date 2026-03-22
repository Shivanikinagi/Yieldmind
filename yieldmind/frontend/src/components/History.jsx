import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function History({ agent, refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agent) return;

    const loadTasks = async () => {
      try {
        setLoading(true);
        const taskCount = await agent.taskCount();
        const count = taskCount.toNumber();

        if (count === 0) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const taskPromises = [];
        for (let i = 1; i <= count; i++) {
          taskPromises.push(agent.tasks(i));
        }

        const taskData = await Promise.all(taskPromises);
        
        const formattedTasks = taskData.map((task) => ({
          id: task.id.toNumber(),
          prompt: task.prompt,
          result: task.result,
          yieldUsed: ethers.utils.formatEther(task.yieldUsed),
          timestamp: new Date(task.timestamp.toNumber() * 1000).toLocaleString(),
          completed: task.completed
        }));

        setTasks(formattedTasks.reverse()); // Most recent first
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    const interval = setInterval(loadTasks, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [agent, refreshTrigger]);

  if (loading) {
    return (
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text2)'
      }}>
        Loading task history...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
        <div style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '8px' }}>
          No tasks yet
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text2)' }}>
          Tasks will appear here once the agent has sufficient yield
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
          Task History
        </h2>
        <div style={{
          padding: '6px 12px',
          background: 'var(--bg3)',
          border: '1px solid var(--border2)',
          borderRadius: '6px',
          fontSize: '13px',
          color: 'var(--text2)',
          fontFamily: 'var(--font-mono)'
        }}>
          {tasks.length} tasks
        </div>
      </div>

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            animation: 'fadein 0.3s ease-out'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                padding: '4px 8px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: '4px',
                fontSize: '12px',
                color: 'var(--text2)',
                fontFamily: 'var(--font-mono)'
              }}>
                #{task.id}
              </div>
              <div style={{
                padding: '4px 8px',
                background: task.completed ? 'var(--green-bg)' : 'var(--amber-bg)',
                border: `1px solid ${task.completed ? 'var(--green-border)' : 'var(--amber-border)'}`,
                borderRadius: '4px',
                fontSize: '11px',
                color: task.completed ? 'var(--green)' : 'var(--amber)',
                textTransform: 'uppercase'
              }}>
                {task.completed ? '✓ Completed' : '⏳ Pending'}
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text3)',
              fontFamily: 'var(--font-mono)'
            }}>
              {task.timestamp}
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px' }}>
              Prompt
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.5' }}>
              {task.prompt}
            </div>
          </div>

          {task.result && (
            <div style={{
              padding: '12px',
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px' }}>
                Result (Filecoin CID)
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--blue)',
                fontFamily: 'var(--font-mono)',
                wordBreak: 'break-all'
              }}>
                {task.result}
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text2)'
          }}>
            <span>⚡ Yield used:</span>
            <span style={{ 
              color: 'var(--amber)',
              fontFamily: 'var(--font-mono)',
              fontWeight: '600'
            }}>
              {task.yieldUsed} ETH
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default History;
